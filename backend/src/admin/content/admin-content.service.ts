import { Injectable, NotFoundException } from "@nestjs/common"
import { ContentSearchQueryDto, BulkContentActionDto } from "./dto/admin-content.dto"
import { ContentRepository } from "../../content/repositories/content.repository"
import { ContentInteractionRepository } from "../../content/repositories/content-interaction.repository"
import { CommentRepository } from "../../content/repositories/comment.repository"
import { Content } from "../../content/entities/content.entity"
import { UserPreferenceRepository } from "../../content/repositories/user-preference.repository"
import { PersonalizedFeedService } from "../../content/personalized-feed.service"

@Injectable()
export class AdminContentService {
  constructor(
    private readonly contentRepo: ContentRepository,
    private readonly interactionRepo: ContentInteractionRepository,
    private readonly commentRepo: CommentRepository,
    private readonly userPreferenceRepo: UserPreferenceRepository,
    private readonly personalizedFeedService: PersonalizedFeedService,
  ) {}

  async getContent(query: ContentSearchQueryDto) {
    const page = query.page || 1
    const limit = query.limit || 20

    const qb = this.contentRepo
      .createQueryBuilder("c")
      .leftJoinAndSelect("c.user", "user")
      .where("c.sortOrder = :so", { so: 0 })

    if (query.search) {
      qb.andWhere("c.caption ILIKE :s", { s: `%${query.search}%` })
    }
    if (query.contentType) {
      qb.andWhere("c.contentType = :ct", { ct: query.contentType })
    }
    if (query.userId) {
      qb.andWhere("c.userId = :uid", { uid: query.userId })
    }
    if (query.isActive !== undefined) {
      qb.andWhere("c.isActive = :ia", { ia: query.isActive })
    }

    const sortBy = query.sortBy || "createdAt"
    const sortColumn = ["viewCount", "engagementScore"].includes(sortBy)
      ? `c.${sortBy}` : "c.createdAt"
    qb.orderBy(sortColumn, "DESC")
      .skip((page - 1) * limit)
      .take(limit)

    const [data, total] = await qb.getManyAndCount()

    return {
      data: data.map((c) => ({
        id: c.id,
        postId: c.postId,
        userId: c.userId,
        user: c.user
          ? { id: c.user.id, username: c.user.username, displayName: c.user.displayName, avatarUrl: c.user.avatarUrl }
          : null,
        contentType: c.contentType,
        caption: c.caption,
        mediaUrl: c.mediaUrl,
        thumbnailUrl: c.thumbnailUrl,
        viewCount: c.viewCount,
        likeCount: c.likeCount,
        commentCount: c.commentCount,
        shareCount: c.shareCount,
        engagementScore: c.engagementScore,
        completionRate: c.completionRate,
        avgWatchTime: c.avgWatchTime,
        avgDwellTime: c.avgDwellTime,
        isActive: c.isActive,
        createdAt: c.createdAt,
      })),
      total,
      page,
      limit,
    }
  }

  async getContentDetail(id: string) {
    const content = await this.contentRepo.findOne({
      where: { id },
      relations: ["user"],
    })
    if (!content) throw new NotFoundException("Content not found")

    // Get all slides for this post
    const slides = await this.contentRepo.find({
      where: { postId: content.postId },
      order: { sortOrder: "ASC" },
    })

    // Interaction breakdown
    const interactionBreakdown = await this.interactionRepo
      .createQueryBuilder("i")
      .select("i.type", "type")
      .addSelect("COUNT(*)", "count")
      .where("i.contentId = :cid", { cid: id })
      .groupBy("i.type")
      .getRawMany()

    // Recent comments
    const recentComments = await this.commentRepo.find({
      where: { contentId: id },
      relations: ["user"],
      order: { createdAt: "DESC" },
      take: 10,
    })

    return {
      ...content,
      user: content.user
        ? { id: content.user.id, username: content.user.username, displayName: content.user.displayName }
        : null,
      slides: slides.map((s) => ({
        id: s.id,
        contentType: s.contentType,
        mediaUrl: s.mediaUrl,
        thumbnailUrl: s.thumbnailUrl,
        caption: s.caption,
        textContent: s.textContent,
        backgroundColor: s.backgroundColor,
        fontStyle: s.fontStyle,
        duration: s.duration,
        sortOrder: s.sortOrder,
      })),
      interactionBreakdown: interactionBreakdown.map((i) => ({
        type: i.type,
        count: Number(i.count),
      })),
      recentComments: recentComments.map((c) => ({
        id: c.id,
        text: c.text,
        userId: c.userId,
        user: (c as any).user
          ? { id: (c as any).user.id, username: (c as any).user.username }
          : null,
        createdAt: c.createdAt,
      })),
    }
  }

  async toggleContentActive(id: string, isActive: boolean) {
    const content = await this.contentRepo.findOne({ where: { id } })
    if (!content) throw new NotFoundException("Content not found")

    // Toggle all slides in the post
    await this.contentRepo.update({ postId: content.postId }, { isActive })
    return { postId: content.postId, isActive }
  }

  async bulkContentAction(dto: BulkContentActionDto) {
    const isActive = dto.action === "activate"
    const result = await this.contentRepo
      .createQueryBuilder()
      .update(Content)
      .set({ isActive })
      .where("postId IN (:...postIds)", { postIds: dto.postIds })
      .execute()

    return { updated: result.affected || 0, action: dto.action }
  }

  async updateContent(id: string, dto: { caption?: string; isActive?: boolean }) {
    const content = await this.contentRepo.findOne({ where: { id } })
    if (!content) throw new NotFoundException("Content not found")

    const updates: Partial<Content> = {}
    if (dto.caption !== undefined) updates.caption = dto.caption
    if (dto.isActive !== undefined) updates.isActive = dto.isActive

    if (Object.keys(updates).length === 0) return content

    // Update the primary slide (sortOrder=0) for caption; isActive applies to all slides
    if (dto.isActive !== undefined) {
      await this.contentRepo.update({ postId: content.postId }, { isActive: dto.isActive })
    }
    if (dto.caption !== undefined) {
      await this.contentRepo.update(id, { caption: dto.caption })
    }

    return this.contentRepo.findOne({ where: { id } })
  }

  async deleteContent(id: string) {
    const content = await this.contentRepo.findOne({ where: { id } })
    if (!content) throw new NotFoundException("Content not found")

    // Soft-delete: deactivate all slides and clear caption
    await this.contentRepo.update(
      { postId: content.postId },
      { isActive: false },
    )

    return { postId: content.postId, deleted: true }
  }

  /**
   * Get user's category preferences for feed personalization.
   * Shows which categories the user has engaged with and their affinity scores.
   * Used for debugging and understanding why certain content appears in their feed.
   */
  async getUserPreferences(userId: string) {
    const preferences = await this.userPreferenceRepo.findByUserId(userId)

    if (preferences.length === 0) {
      return {
        userId,
        message: "User has no preferences yet. Feed will use randomized algorithm or signup interests.",
        preferences: [],
      }
    }

    return {
      userId,
      totalCategories: preferences.length,
      preferences: preferences.map((p) => ({
        category: p.category,
        affinityScore: Number(p.affinityScore).toFixed(3),
        engagementCount: p.engagementCount,
        lastEngagementAt: p.lastEngagementAt,
      })),
      topCategories: preferences
        .slice(0, 5)
        .map((p) => p.category),
    }
  }

  /**
   * Preview what the user's personalized feed would look like.
   * Returns the first N posts with their scores and categories.
   * Used for debugging personalization algorithm.
   */
  async getUserFeedPreview(userId: string, limit: number = 20) {
    const preferences = await this.userPreferenceRepo.findByUserId(userId)

    if (preferences.length === 0) {
      return {
        userId,
        message: "User has no preferences. Personalized feed is disabled.",
        preview: [],
      }
    }

    // Get the personalized feed (no blocked users filter for admin preview)
    const feed = await this.personalizedFeedService.getPersonalizedFeed(
      userId,
      [], // No blocked users
      { page: 1, limit },
    )

    return {
      userId,
      totalPosts: feed.length,
      preview: feed.map((post) => ({
        id: post.id,
        postId: post.postId,
        caption: post.caption?.substring(0, 100) || "(no caption)",
        contentType: post.contentType,
        categories: post.categories || [],
        viewCount: post.viewCount,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        engagementScore: Number(post.engagementScore).toFixed(2),
        createdAt: post.createdAt,
      })),
    }
  }
}
