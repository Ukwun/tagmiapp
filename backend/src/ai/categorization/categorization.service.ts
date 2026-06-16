/**
 * CategorizationService
 *
 * Classifies content into predefined categories using embedding similarity.
 * Pre-computes embeddings for each category label on startup, then compares
 * incoming text against those embeddings using cosine similarity.
 *
 * Supports both raw text categorization and categorization by content ID
 * (which pulls in transcription + AI description for richer classification).
 *
 * This service does NOT analyze media — that is MediaAnalysisService's job.
 * This service does NOT store embeddings — that is EmbeddingsService's job.
 */
import { Injectable, Logger, OnModuleInit, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { EmbeddingsService } from "../embeddings/embeddings.service"
import { Content } from "../../content/entities/content.entity"
import { TALENT_CATEGORIES } from "../../common/constants/categories.constant"

@Injectable()
export class CategorizationService implements OnModuleInit {
  private readonly logger = new Logger(CategorizationService.name)
  private categoryEmbeddings = new Map<string, number[]>()

  constructor(
    private readonly embeddingsService: EmbeddingsService,
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
  ) {}

  async onModuleInit() {
    // Pre-compute category embeddings in the background
    this.precomputeCategoryEmbeddings().catch((err) => {
      this.logger.warn("Failed to precompute category embeddings — will retry on first use", err.message)
    })
  }

  private async precomputeCategoryEmbeddings() {
    // Wait for the model to be ready
    let retries = 0
    while (!this.embeddingsService.isModelReady() && retries < 30) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      retries++
    }

    if (!this.embeddingsService.isModelReady()) {
      this.logger.warn("Embedding model not ready after waiting — skipping category precomputation")
      return
    }

    this.logger.log("Pre-computing category embeddings...")
    for (const category of TALENT_CATEGORIES) {
      const embedding = await this.embeddingsService.generateEmbedding(category)
      if (embedding) {
        this.categoryEmbeddings.set(category, embedding)
      }
    }
    this.logger.log(`Pre-computed ${this.categoryEmbeddings.size} category embeddings`)
  }

  /**
   * Categorize text content using embedding similarity to category labels.
   * Returns ranked categories with confidence scores.
   */
  async categorize(text: string, topK = 3): Promise<{ category: string; confidence: number }[]> {
    if (this.categoryEmbeddings.size === 0) {
      await this.precomputeCategoryEmbeddings()
    }

    if (this.categoryEmbeddings.size === 0) {
      return []
    }

    const textEmbedding = await this.embeddingsService.generateEmbedding(text)
    if (!textEmbedding) return []

    const scores = Array.from(this.categoryEmbeddings.entries())
      .map(([category, catEmbedding]) => ({
        category,
        confidence: this.embeddingsService.cosineSimilarity(textEmbedding, catEmbedding),
      }))
      .sort((a, b) => b.confidence - a.confidence)

    return scores.slice(0, topK)
  }

  /**
   * Categorize a content item by its ID using all available enriched text.
   * Builds text from caption + hashtags + transcription + AI description,
   * runs categorization, and saves the result to the content entity.
   */
  async categorizeByContentId(contentId: string): Promise<{ category: string; confidence: number }[]> {
    const content = await this.contentRepository.findOne({ where: { id: contentId } })
    if (!content) {
      throw new NotFoundException("Content not found")
    }

    // Build enriched text from all available sources
    const parts: string[] = []
    if (content.caption) parts.push(content.caption)
    if (content.hashtags?.length) parts.push(content.hashtags.join(" "))
    if (content.transcription) parts.push(content.transcription)
    if (content.aiDescription) parts.push(content.aiDescription)

    const text = parts.join(" ").trim()
    if (!text) return []

    const categories = await this.categorize(text, 3)

    // Save categories to the content entity
    if (categories.length > 0) {
      await this.contentRepository.update(contentId, { categories })
    }

    return categories
  }

  /**
   * Get list of available categories.
   */
  getCategories(): string[] {
    return [...TALENT_CATEGORIES]
  }
}
