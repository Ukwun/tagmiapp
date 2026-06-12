import { Injectable, NotFoundException, ConflictException, Inject, forwardRef, Optional, Logger } from "@nestjs/common"
import { FollowRepository } from "./repositories/follow.repository"
import { UserRepository } from "../users/repositories/user.repository"
import { NotificationsService } from "../notifications/notifications.service"
import { ValidationPipelineService } from "../referrals/services/validation-pipeline.service"

@Injectable()
export class FollowsService {
  private readonly logger = new Logger(FollowsService.name)

  constructor(
    private followRepository: FollowRepository,
    private userRepository: UserRepository,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    @Optional() @Inject(forwardRef(() => ValidationPipelineService))
    private validationPipelineService?: ValidationPipelineService,
  ) {}

  async followUser(followerId: string, followingId: string): Promise<{ success: boolean; message: string }> {
    // Prevent self-follow
    if (followerId === followingId) {
      throw new ConflictException("You cannot follow yourself")
    }

    // Check if both users exist
    const [follower, following] = await Promise.all([
      this.userRepository.findByIdOptional(followerId),
      this.userRepository.findByIdOptional(followingId),
    ])

    if (!follower || !following) {
      throw new NotFoundException("User not found")
    }

    // Check if already following
    const existingFollow = await this.followRepository.findOne({
      where: { followerId, followingId },
    })

    if (existingFollow) {
      throw new ConflictException("You are already following this user")
    }

    // Create follow relationship
    const follow = this.followRepository.create({ followerId, followingId })
    await this.followRepository.save(follow)

    // Update follower counts
    follower.followingCount += 1
    following.followersCount += 1

    await Promise.all([this.userRepository.save(follower), this.userRepository.save(following)])

    // Create notification for the user being followed
    await this.notificationsService.createFollowNotification(followingId, followerId)

    // Trigger referral validation check
    if (this.validationPipelineService) {
      try {
        const referral = await this.validationPipelineService.getActiveReferralForUser(followerId)
        if (referral) {
          await this.validationPipelineService.runValidation(referral.id)
        }
      } catch (error) {
        this.logger.warn(`Failed to trigger referral validation for user ${followerId}: ${error.message}`)
      }
    }

    return { success: true, message: "Successfully followed user" }
  }

  async unfollowUser(followerId: string, followingId: string): Promise<{ success: boolean; message: string }> {
    // Find the follow relationship
    const follow = await this.followRepository.findOne({
      where: { followerId, followingId },
    })

    if (!follow) {
      throw new NotFoundException("You are not following this user")
    }

    // Delete follow relationship
    await this.followRepository.remove(follow)

    // Update follower counts
    const [follower, following] = await Promise.all([
      this.userRepository.findByIdOptional(followerId),
      this.userRepository.findByIdOptional(followingId),
    ])

    if (follower && following) {
      follower.followingCount = Math.max(0, follower.followingCount - 1)
      following.followersCount = Math.max(0, following.followersCount - 1)

      await Promise.all([this.userRepository.save(follower), this.userRepository.save(following)])
    }

    return { success: true, message: "Successfully unfollowed user" }
  }

  async getFollowers(userId: string, page = 1, limit = 20, currentUserId?: string) {
    const [follows, total] = await this.followRepository.findAndCount({
      where: { followingId: userId },
      relations: ["follower"],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    })

    // Check which followers the current user is following
    const followerIds = follows.map((f) => f.follower.id)
    let followingMap: Map<string, boolean> = new Map()

    if (currentUserId && followerIds.length > 0) {
      const currentUserFollowing = await this.followRepository.find({
        where: {
          followerId: currentUserId,
        },
      })
      currentUserFollowing.forEach((f) => followingMap.set(f.followingId, true))
    }

    const followers = follows.map((follow) => ({
      id: follow.follower.id,
      username: follow.follower.username,
      displayName: follow.follower.displayName,
      avatarUrl: follow.follower.avatarUrl,
      isVerified: follow.follower.isVerified,
      isFollowing: followingMap.get(follow.follower.id) || false,
      followedAt: follow.createdAt,
    }))

    return {
      data: followers,
      total,
      page,
      limit,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    }
  }

  async getFollowing(userId: string, page = 1, limit = 20) {
    const [follows, total] = await this.followRepository.findAndCount({
      where: { followerId: userId },
      relations: ["following"],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    })

    const following = follows.map((follow) => ({
      id: follow.following.id,
      username: follow.following.username,
      displayName: follow.following.displayName,
      avatarUrl: follow.following.avatarUrl,
      isVerified: follow.following.isVerified,
      isFollowing: true, // All users in this list are being followed
      followedAt: follow.createdAt,
    }))

    return {
      data: following,
      total,
      page,
      limit,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    }
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followRepository.findOne({
      where: { followerId, followingId },
    })

    return !!follow
  }

  async getFollowStats(userId: string) {
    const user = await this.userRepository.findByIdOptional(userId)

    if (!user) {
      throw new NotFoundException("User not found")
    }

    return {
      followersCount: user.followersCount,
      followingCount: user.followingCount,
    }
  }
}