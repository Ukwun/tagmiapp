import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, In } from "typeorm"
import { EmbeddingsService } from "../embeddings/embeddings.service"
import { Content } from "../../content/entities/content.entity"
import { User } from "../../users/entities/user.entity"

@Injectable()
export class SearchService {
  constructor(
    private readonly embeddingsService: EmbeddingsService,
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Semantic search for content — understands meaning, not just keywords.
   */
  async searchContent(query: string, page = 1, limit = 20) {
    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 20

    if (!this.embeddingsService.isModelReady()) {
      return { data: [], total: 0, page: pageNum, limit: limitNum, modelReady: false }
    }

    const results = await this.embeddingsService.semanticSearch(query, pageNum * limitNum)

    // Paginate
    const paged = results.slice((pageNum - 1) * limitNum, pageNum * limitNum)
    if (paged.length === 0) {
      return { data: [], total: results.length, page: pageNum, limit: limitNum }
    }

    const contentIds = paged.map((r) => r.contentId)
    const contents = await this.contentRepository.find({
      where: { id: In(contentIds), isActive: true },
      relations: ["user"],
    })

    const contentMap = new Map(contents.map((c) => [c.id, c]))
    const similarityMap = new Map(paged.map((r) => [r.contentId, r.similarity]))

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
          viewCount: content.viewCount,
          likeCount: content.likeCount,
          commentCount: content.commentCount,
          createdAt: content.createdAt,
        }
      })
      .filter(Boolean)

    return { data, total: results.length, page: pageNum, limit: limitNum }
  }

  /**
   * Semantic search for talent/users.
   */
  async searchTalent(query: string, page = 1, limit = 20) {
    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 20

    if (!this.embeddingsService.isModelReady()) {
      return { data: [], total: 0, page: pageNum, limit: limitNum, modelReady: false }
    }

    const results = await this.embeddingsService.semanticUserSearch(query, pageNum * limitNum)

    const paged = results.slice((pageNum - 1) * limitNum, pageNum * limitNum)
    if (paged.length === 0) {
      return { data: [], total: results.length, page: pageNum, limit: limitNum }
    }

    const userIds = paged.map((r) => r.userId)
    const users = await this.userRepository.find({
      where: { id: In(userIds), isActive: true },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))
    const similarityMap = new Map(paged.map((r) => [r.userId, r.similarity]))

    const data = userIds
      .map((id) => {
        const user = userMap.get(id)
        if (!user) return null
        return {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          followersCount: user.followersCount,
          isVerified: user.isVerified,
          similarity: similarityMap.get(id) || 0,
        }
      })
      .filter(Boolean)

    return { data, total: results.length, page: pageNum, limit: limitNum }
  }
}
