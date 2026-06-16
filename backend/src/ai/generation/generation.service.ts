import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { EmbeddingsService } from "../embeddings/embeddings.service"
import { Content } from "../../content/entities/content.entity"
import { ContentEmbedding } from "../embeddings/content-embedding.entity"

@Injectable()
export class GenerationService {
  constructor(
    private readonly embeddingsService: EmbeddingsService,
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(ContentEmbedding)
    private readonly contentEmbeddingRepository: Repository<ContentEmbedding>,
  ) {}

  /**
   * Suggest hashtags for a given caption by finding semantically similar posts
   * and extracting their hashtags.
   */
  async suggestHashtags(caption: string, limit = 10): Promise<string[]> {
    if (!this.embeddingsService.isModelReady()) {
      return this.fallbackHashtagSuggestion(caption)
    }

    // Find similar content via embeddings
    const similar = await this.embeddingsService.semanticSearch(caption, 30)
    if (similar.length === 0) {
      return this.fallbackHashtagSuggestion(caption)
    }

    // Get content items to extract their hashtags
    const contentIds = similar.map((s) => s.contentId)
    const contents = await this.contentRepository
      .createQueryBuilder("content")
      .select(["content.id", "content.hashtags"])
      .where("content.id IN (:...ids)", { ids: contentIds })
      .getMany()

    // Count hashtag frequency across similar posts, weighted by similarity
    const hashtagScores = new Map<string, number>()
    const similarityMap = new Map(similar.map((s) => [s.contentId, s.similarity]))

    for (const content of contents) {
      if (!content.hashtags?.length) continue
      const weight = similarityMap.get(content.id) || 0

      for (const tag of content.hashtags) {
        const normalized = tag.toLowerCase().replace(/^#/, "")
        if (normalized) {
          hashtagScores.set(normalized, (hashtagScores.get(normalized) || 0) + weight)
        }
      }
    }

    // Return top hashtags sorted by weighted frequency
    return Array.from(hashtagScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag]) => tag)
  }

  /**
   * Fallback: extract keywords from caption + pull popular hashtags from recent content.
   */
  private async fallbackHashtagSuggestion(caption: string): Promise<string[]> {
    // Extract existing hashtags from caption
    const existing = caption.match(/#\w+/g)?.map((h) => h.replace("#", "").toLowerCase()) || []

    // Extract significant words (>3 chars, not common words)
    const stopWords = new Set(["this", "that", "with", "from", "have", "been", "were", "they", "their", "about", "would", "could", "should", "your", "just", "like", "more", "some", "than", "them", "what", "when", "will", "very", "much", "also", "only", "into", "over", "such", "really", "want", "know", "make", "made", "good", "look"])
    const words = caption
      .replace(/#\w+/g, "")
      .replace(/[^a-zA-Z\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w.toLowerCase()))
      .map((w) => w.toLowerCase())

    const captionTags = [...new Set([...existing, ...words])]

    // Also pull popular hashtags from recent content
    try {
      const recentContent = await this.contentRepository
        .createQueryBuilder("content")
        .select("content.hashtags")
        .where("content.hashtags IS NOT NULL")
        .orderBy("content.createdAt", "DESC")
        .limit(50)
        .getMany()

      const tagCounts = new Map<string, number>()
      for (const c of recentContent) {
        if (!c.hashtags?.length) continue
        for (const tag of c.hashtags) {
          const normalized = tag.toLowerCase().replace(/^#/, "")
          if (normalized && normalized.length > 2) {
            tagCounts.set(normalized, (tagCounts.get(normalized) || 0) + 1)
          }
        }
      }

      const popularTags = Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag]) => tag)

      // Combine: caption keywords first, then popular tags, deduplicated
      const combined = [...captionTags]
      for (const tag of popularTags) {
        if (!combined.includes(tag)) combined.push(tag)
      }
      return combined.slice(0, 10)
    } catch {
      return captionTags.slice(0, 10)
    }
  }
}
