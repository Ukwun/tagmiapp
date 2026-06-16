import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { User } from "../../users/entities/user.entity"
import { Follow } from "../../follows/entities/follow.entity"
import { Content } from "../../content/entities/content.entity"

@Injectable()
export class DiscoveryService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
  ) {}

  /**
   * Find similar creators based on:
   * 1. Shared followers (Jaccard similarity on follow graph)
   * 2. Overlapping interests
   * 3. Similar content hashtags
   */
  async getSimilarCreators(userId: string, limit = 10) {
    const limitNum = Number(limit) || 10

    // Get users with the most shared followers (people who follow both userId and the candidate)
    const similarByFollowers = await this.followRepository
      .createQueryBuilder("f1")
      .select("f2.followingId", "candidateId")
      .addSelect("COUNT(*)", "sharedFollowers")
      .innerJoin(Follow, "f2", "f1.followerId = f2.followerId AND f2.followingId != :userId", { userId })
      .where("f1.followingId = :userId", { userId })
      .groupBy("f2.followingId")
      .orderBy("COUNT(*)", "DESC")
      .limit(limitNum * 2)
      .getRawMany()

    if (similarByFollowers.length === 0) {
      // Fallback: return popular users the person doesn't follow
      return this.getFallbackSuggestions(userId, limitNum)
    }

    const candidateIds = similarByFollowers.map((r) => r.candidateId)

    // Filter out users already followed
    const alreadyFollowing = await this.followRepository.find({
      where: { followerId: userId },
      select: ["followingId"],
    })
    const followingSet = new Set(alreadyFollowing.map((f) => f.followingId))

    const filteredIds = candidateIds.filter((id) => !followingSet.has(id))
    if (filteredIds.length === 0) {
      return this.getFallbackSuggestions(userId, limitNum)
    }

    // Fetch full user data
    const users = await this.userRepository
      .createQueryBuilder("user")
      .where("user.id IN (:...ids)", { ids: filteredIds.slice(0, limitNum) })
      .andWhere("user.isActive = :isActive", { isActive: true })
      .getMany()

    // Build similarity scores
    const sharedMap = new Map(similarByFollowers.map((r) => [r.candidateId, Number(r.sharedFollowers)]))

    return users
      .map((user) => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        followersCount: user.followersCount,
        isVerified: user.isVerified,
        sharedFollowers: sharedMap.get(user.id) || 0,
      }))
      .sort((a, b) => b.sharedFollowers - a.sharedFollowers)
  }

  /**
   * Get a personalized "For You" feed mixing content from:
   * 1. Similar creators (not yet followed)
   * 2. Trending content
   * 3. Content with overlapping hashtags to user's interests
   */
  async getForYouFeed(userId: string, page = 1, limit = 20) {
    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 20

    // Get user's interests and frequently used hashtags
    const user = await this.userRepository.findOne({ where: { id: userId } })
    const userHashtags = await this.getUserTopHashtags(userId)

    // Get IDs the user already follows (to exclude from discovery)
    const follows = await this.followRepository.find({
      where: { followerId: userId },
      select: ["followingId"],
    })
    const followingIds = new Set(follows.map((f) => f.followingId))
    followingIds.add(userId) // Exclude own posts

    // Build query: high engagement posts from non-followed users
    const queryBuilder = this.contentRepository
      .createQueryBuilder("content")
      .leftJoinAndSelect("content.user", "user")
      .where("content.isActive = :isActive", { isActive: true })
      .andWhere("content.sortOrder = :sortOrder", { sortOrder: 0 })
      .andWhere("user.isActive = :userActive", { userActive: true })

    // Exclude already-followed users
    if (followingIds.size > 0) {
      queryBuilder.andWhere("content.userId NOT IN (:...excludeIds)", {
        excludeIds: Array.from(followingIds),
      })
    }

    // Boost posts matching user's top hashtags
    if (userHashtags.length > 0) {
      const hashtagConditions = userHashtags
        .map((_, i) => `content.hashtags ILIKE :ht${i}`)
        .join(" OR ")
      const hashtagParams = Object.fromEntries(
        userHashtags.map((ht, i) => [`ht${i}`, `%${ht}%`]),
      )

      // Order by: matching hashtags first, then virality, then engagement
      queryBuilder.orderBy(
        `CASE WHEN (${hashtagConditions}) THEN 1 ELSE 0 END`,
        "DESC",
      )
      queryBuilder.setParameters(hashtagParams)
      queryBuilder.addOrderBy("content.viralityScore", "DESC")
      queryBuilder.addOrderBy("content.engagementScore", "DESC")
    } else {
      queryBuilder.orderBy("content.viralityScore", "DESC")
      queryBuilder.addOrderBy("content.engagementScore", "DESC")
    }

    queryBuilder.addOrderBy("content.createdAt", "DESC")

    const [posts, total] = await queryBuilder
      .skip((pageNum - 1) * limitNum)
      .take(limitNum)
      .getManyAndCount()

    return {
      data: posts.map((p) => ({
        postId: p.postId,
        userId: p.userId,
        user: p.user,
        caption: p.caption,
        hashtags: p.hashtags,
        contentType: p.contentType,
        mediaUrl: p.mediaUrl,
        thumbnailUrl: p.thumbnailUrl,
        engagementScore: p.engagementScore,
        viewCount: p.viewCount,
        likeCount: p.likeCount,
        commentCount: p.commentCount,
        shareCount: p.shareCount,
        createdAt: p.createdAt,
      })),
      total,
      page: pageNum,
      limit: limitNum,
    }
  }

  /**
   * Get a user's most frequently used hashtags.
   */
  private async getUserTopHashtags(userId: string, limit = 10): Promise<string[]> {
    const posts = await this.contentRepository.find({
      where: { userId, isActive: true },
      select: ["hashtags"],
      order: { createdAt: "DESC" },
      take: 50,
    })

    const counts = new Map<string, number>()
    for (const post of posts) {
      if (!post.hashtags) continue
      for (const tag of post.hashtags) {
        const normalized = tag.toLowerCase().replace(/^#/, "")
        if (normalized) {
          counts.set(normalized, (counts.get(normalized) || 0) + 1)
        }
      }
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag]) => tag)
  }

  /**
   * Fallback: suggest popular users the person doesn't follow.
   */
  private async getFallbackSuggestions(userId: string, limit: number) {
    const alreadyFollowing = await this.followRepository.find({
      where: { followerId: userId },
      select: ["followingId"],
    })
    const excludeIds = [userId, ...alreadyFollowing.map((f) => f.followingId)]

    const users = await this.userRepository
      .createQueryBuilder("user")
      .where("user.isActive = :isActive", { isActive: true })
      .andWhere("user.id NOT IN (:...excludeIds)", { excludeIds })
      .orderBy("user.followersCount", "DESC")
      .take(limit)
      .getMany()

    return users.map((user) => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      followersCount: user.followersCount,
      isVerified: user.isVerified,
      sharedFollowers: 0,
    }))
  }
}
