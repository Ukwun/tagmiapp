import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, In } from "typeorm"
import { EmbeddingsService } from "../embeddings/embeddings.service"
import { Content } from "../../content/entities/content.entity"

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly embeddingsService: EmbeddingsService,
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
  ) {}

  /**
   * Get content similar to a given post.
   */
  async getSimilarContent(contentId: string, limit = 10) {
    const limitNum = Number(limit) || 10

    if (!this.embeddingsService.isModelReady()) {
      return { data: [], modelReady: false }
    }

    const results = await this.embeddingsService.findSimilarContent(contentId, limitNum)
    if (results.length === 0) return { data: [] }

    const contentIds = results.map((r) => r.contentId)
    const contents = await this.contentRepository.find({
      where: { id: In(contentIds), isActive: true },
      relations: ["user"],
    })

    const contentMap = new Map(contents.map((c) => [c.id, c]))
    const similarityMap = new Map(results.map((r) => [r.contentId, r.similarity]))

    const data = contentIds
      .map((id) => {
        const content = contentMap.get(id)
        if (!content) return null
        return {
          postId: content.postId,
          userId: content.userId,
          user: content.user,
          caption: content.caption,
          hashtags: content.hashtags,
          contentType: content.contentType,
          mediaUrl: content.mediaUrl,
          thumbnailUrl: content.thumbnailUrl,
          similarity: similarityMap.get(id) || 0,
          likeCount: content.likeCount,
          commentCount: content.commentCount,
          createdAt: content.createdAt,
        }
      })
      .filter(Boolean)

    return { data }
  }

  /**
   * Get a personalized AI-powered feed for a user based on their embedding profile.
   * Combines content from similar users + content similar to what the user has engaged with.
   */
  async getRecommendedFeed(userId: string, page = 1, limit = 20) {
    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 20

    if (!this.embeddingsService.isModelReady()) {
      return { data: [], total: 0, page: pageNum, limit: limitNum, modelReady: false }
    }

    // Find users similar to this user
    const similarUsers = await this.embeddingsService.findSimilarUsers(userId, 20)
    if (similarUsers.length === 0) {
      return { data: [], total: 0, page: pageNum, limit: limitNum }
    }

    const similarUserIds = similarUsers.map((u) => u.userId)

    // Get recent content from similar users, ranked by engagement
    const [contents, total] = await this.contentRepository
      .createQueryBuilder("content")
      .leftJoinAndSelect("content.user", "user")
      .where("content.userId IN (:...userIds)", { userIds: similarUserIds })
      .andWhere("content.isActive = :isActive", { isActive: true })
      .andWhere("content.sortOrder = :sortOrder", { sortOrder: 0 })
      .andWhere("user.isActive = :userActive", { userActive: true })
      .orderBy("content.engagementScore", "DESC")
      .addOrderBy("content.createdAt", "DESC")
      .skip((pageNum - 1) * limitNum)
      .take(limitNum)
      .getManyAndCount()

    const data = contents.map((content) => ({
      postId: content.postId,
      userId: content.userId,
      user: content.user,
      caption: content.caption,
      hashtags: content.hashtags,
      contentType: content.contentType,
      mediaUrl: content.mediaUrl,
      thumbnailUrl: content.thumbnailUrl,
      engagementScore: content.engagementScore,
      viewCount: content.viewCount,
      likeCount: content.likeCount,
      commentCount: content.commentCount,
      createdAt: content.createdAt,
    }))

    return { data, total, page: pageNum, limit: limitNum }
  }
}
