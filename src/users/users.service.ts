/**
 * UsersService
 *
 * Manages user profiles, talent profiles, settings, and account operations.
 * Handles avatar/cover uploads, user search, talent discovery, and account deletion.
 *
 * Used by: UsersController, FollowsService, BookingsService
 */
import { Injectable, Logger, Inject, forwardRef, Optional } from "@nestjs/common"
import type { UpdateUserDto } from "./dto/update-user.dto"
import type { UpdateTalentProfileDto } from "./dto/update-talent-profile.dto"
import type { UpdateSettingsDto } from "./dto/update-settings.dto"
import { StorageService } from "../config/storage.service"
import { ValidationPipelineService } from "../referrals/services/validation-pipeline.service"
import { ErrorHandler } from "../common/exceptions/error.handler"
import { ERROR_MESSAGES } from "../common/constants/error-messages.constant"
import { UserRepository } from "./repositories/user.repository"
import { TalentProfileRepository } from "./repositories/talent-profile.repository"
import { ClientProfileRepository } from "./repositories/client-profile.repository"
import { UserSettingsRepository } from "./repositories/user-settings.repository"
import { FollowRepository } from "../follows/repositories/follow.repository"
import type { User } from "./entities/user.entity"
import type { TalentProfile } from "./entities/talent-profile.entity"
import type { UserSettings } from "./entities/user-settings.entity"

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(
    private userRepository: UserRepository,
    private talentProfileRepository: TalentProfileRepository,
    private clientProfileRepository: ClientProfileRepository,
    private settingsRepository: UserSettingsRepository,
    private followRepository: FollowRepository,
    private storageService: StorageService,
    @Optional() @Inject(forwardRef(() => ValidationPipelineService))
    private validationPipelineService?: ValidationPipelineService,
  ) {}

  /**
   * Triggers referral validation after profile updates.
   * Silent failure — logs warnings but doesn't block operations.
   */
  private async triggerReferralValidation(userId: string): Promise<void> {
    if (!this.validationPipelineService) return
    try {
      const referral = await this.validationPipelineService.getActiveReferralForUser(userId)
      if (referral) {
        await this.validationPipelineService.runValidation(referral.id)
      }
    } catch (error) {
      this.logger.warn(`Failed to trigger referral validation for user ${userId}: ${error.message}`)
    }
  }

  async findById(id: string): Promise<User> {
    return this.userRepository.findById(id)
  }

  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findByUsername(username)
  }

  /**
   * Finds user by ID or username (auto-detects based on UUID format).
   */
  async findByIdOrUsername(idOrUsername: string): Promise<User> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrUsername)
    return isUuid ? this.findById(idOrUsername) : this.findByUsername(idOrUsername)
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(userId)
    Object.assign(user, updateUserDto)
    const savedUser = await this.userRepository.save(user)
    await this.triggerReferralValidation(userId)
    return savedUser
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<{ avatarUrl: string }> {
    if (!file) {
      ErrorHandler.badRequest(ERROR_MESSAGES.FILE_UPLOAD_FAILED)
    }

    if (!file.mimetype.startsWith("image/")) {
      ErrorHandler.badRequest(ERROR_MESSAGES.INVALID_FILE_TYPE)
    }

    const user = await this.findById(userId)
    const uploadResult = await this.storageService.uploadImage(file, "avatars")

    user.avatarUrl = uploadResult.secure_url
    await this.userRepository.save(user)
    await this.triggerReferralValidation(userId)

    return { avatarUrl: uploadResult.secure_url }
  }

  async uploadCover(userId: string, file: Express.Multer.File): Promise<{ coverImageUrl: string }> {
    if (!file) {
      ErrorHandler.badRequest(ERROR_MESSAGES.FILE_UPLOAD_FAILED)
    }

    if (!file.mimetype.startsWith("image/")) {
      ErrorHandler.badRequest(ERROR_MESSAGES.INVALID_FILE_TYPE)
    }

    const user = await this.findById(userId)
    const uploadResult = await this.storageService.uploadImage(file, "covers")

    user.coverImageUrl = uploadResult.secure_url
    await this.userRepository.save(user)

    return { coverImageUrl: uploadResult.secure_url }
  }

  async updateTalentProfile(userId: string, updateTalentProfileDto: UpdateTalentProfileDto): Promise<TalentProfile> {
    await this.findById(userId)

    let talentProfile = await this.talentProfileRepository.findByUserIdOptional(userId)

    if (!talentProfile) {
      return this.talentProfileRepository.create({
        userId,
        ...updateTalentProfileDto,
      })
    } else {
      Object.assign(talentProfile, updateTalentProfileDto)
      return this.talentProfileRepository.save(talentProfile)
    }
  }

  async getTalentProfile(userId: string): Promise<TalentProfile> {
    return this.talentProfileRepository.findByUserId(userId)
  }

  async getSuggestedUsers(currentUserId: string, limit = 5) {
    const followedIds = await this.followRepository
      .createQueryBuilder("follow")
      .select("follow.followingId")
      .where("follow.followerId = :currentUserId", { currentUserId })
      .getMany()

    const excludeIds = [currentUserId, ...followedIds.map((f) => f.followingId)]

    const users = await this.userRepository.findSuggestedUsers(excludeIds, limit)

    // All suggested users are not followed by definition (they were excluded)
    return users.map((user) => ({
      ...user,
      isFollowing: false,
    }))
  }

  async searchUsers(query: string, limit = 10, currentUserId?: string) {
    const users = await this.userRepository.searchUsers(query, limit)

    // If authenticated, check follow status for each user
    if (currentUserId && users.length > 0) {
      const follows = await this.followRepository.find({
        where: { followerId: currentUserId },
        select: ["followingId"],
      })
      const followingIds = new Set(follows.map((f) => f.followingId))

      return users.map((user) => ({
        ...user,
        isFollowing: followingIds.has(user.id),
      }))
    }

    // If not authenticated, return users without follow status
    return users.map((user) => ({
      ...user,
      isFollowing: false,
    }))
  }

  /**
   * Gets or creates user settings (lazy initialization).
   */
  async getOrCreateSettings(userId: string): Promise<UserSettings> {
    let settings = await this.settingsRepository.findByUserIdOptional(userId)
    if (!settings) {
      settings = await this.settingsRepository.create(userId)
    }
    return settings
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto): Promise<UserSettings> {
    let settings = await this.settingsRepository.findByUserIdOptional(userId)
    if (!settings) {
      settings = await this.settingsRepository.create(userId)
    }
    Object.assign(settings, dto)
    return this.settingsRepository.save(settings)
  }

  /**
   * Soft-deletes account (anonymizes data, preserves referential integrity).
   */
  async deleteAccount(userId: string): Promise<void> {
    const user = await this.findById(userId)
    const ts = Date.now()
    user.isActive = false
    user.email = `deleted_${ts}@deleted.tagmi`
    user.username = `deleted_${ts}`
    user.displayName = "Deleted User"
    user.avatarUrl = null
    user.coverImageUrl = null
    user.bio = null
    await this.userRepository.save(user)
  }

  /**
   * Searches bookable talents with pagination and filtering.
   * Only shows users with isBookable = true on their talent profile.
   */
  async searchTalents(query?: string, skills?: string[], categories?: string[], page = 1, limit = 20, excludeUserId?: string) {
    const [talentProfiles, total] = await this.talentProfileRepository.searchTalents(
      query,
      skills,
      categories,
      page,
      limit,
      excludeUserId,
    )

    let followingIds = new Set<string>()
    if (excludeUserId && talentProfiles.length > 0) {
      const follows = await this.followRepository.find({
        where: { followerId: excludeUserId },
        select: ["followingId"],
      })
      followingIds = new Set(follows.map((f) => f.followingId))
    }

    const data = talentProfiles.map((profile) => ({
      ...profile.user,
      talentProfile: profile,
      isFollowing: followingIds.has(profile.user.id),
    }))

    return {
      data,
      total,
      page,
      limit,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    }
  }
}
