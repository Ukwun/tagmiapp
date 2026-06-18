import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Cron, CronExpression } from "@nestjs/schedule"
import { ContentEmbedding } from "./content-embedding.entity"
import { UserEmbedding } from "./user-embedding.entity"
import { Content } from "../../content/entities/content.entity"
import { User } from "../../users/entities/user.entity"

@Injectable()
export class EmbeddingsService implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingsService.name)
  private pipeline: any = null
  private isModelLoading = false

  constructor(
    @InjectRepository(ContentEmbedding)
    private readonly contentEmbeddingRepository: Repository<ContentEmbedding>,
    @InjectRepository(UserEmbedding)
    private readonly userEmbeddingRepository: Repository<UserEmbedding>,
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    // Load model in the background to not block startup
    this.loadModel().catch((err) => {
      this.logger.warn("Failed to load embedding model on startup — will retry on first use", err.message)
    })
  }

  private async loadModel() {
    if (this.pipeline || this.isModelLoading) return
    this.isModelLoading = true

    try {
      this.logger.log("Loading embedding model (all-MiniLM-L6-v2)...")
      const { pipeline } = await import("@xenova/transformers")
      this.pipeline = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2")
      this.logger.log("Embedding model loaded successfully")
    } catch (error) {
      this.logger.error("Failed to load embedding model", error.message)
      this.pipeline = null
    } finally {
      this.isModelLoading = false
    }
  }

  /**
   * Generate a 384-dim embedding vector from text.
   */
  async generateEmbedding(text: string): Promise<number[] | null> {
    if (!this.pipeline) {
      await this.loadModel()
    }
    if (!this.pipeline) return null

    try {
      const output = await this.pipeline(text, { pooling: "mean", normalize: true })
      return Array.from(output.data)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.error("Failed to generate embedding", message)
      return null
    }
  }

  /**
   * Compute cosine similarity between two embedding vectors.
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0
    let dot = 0
    let normA = 0
    let normB = 0
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  /**
   * Generate and store embedding for a single content item.
   */
  async embedContent(contentId: string): Promise<void> {
    const content = await this.contentRepository.findOne({ where: { id: contentId } })
    if (!content) return

    const text = this.buildContentText(content)
    const embedding = await this.generateEmbedding(text)
    if (!embedding) return

    await this.contentEmbeddingRepository.upsert(
      { contentId, embedding: JSON.stringify(embedding) },
      ["contentId"],
    )
  }

  /**
   * Generate and store embedding for a single user.
   */
  async embedUser(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } })
    if (!user) return

    const text = this.buildUserText(user)
    const embedding = await this.generateEmbedding(text)
    if (!embedding) return

    await this.userEmbeddingRepository.upsert(
      { userId, embedding: JSON.stringify(embedding) },
      ["userId"],
    )
  }

  /**
   * Get the embedding for a content item (from cache/DB).
   */
  async getContentEmbedding(contentId: string): Promise<number[] | null> {
    const record = await this.contentEmbeddingRepository.findOne({ where: { contentId } })
    if (record) return JSON.parse(record.embedding)
    return null
  }

  /**
   * Get the embedding for a user (from cache/DB).
   */
  async getUserEmbedding(userId: string): Promise<number[] | null> {
    const record = await this.userEmbeddingRepository.findOne({ where: { userId } })
    if (record) return JSON.parse(record.embedding)
    return null
  }

  /**
   * Backfill: generate embeddings for all content without embeddings.
   * Runs once daily at 3am.
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async backfillContentEmbeddings() {
    if (!this.pipeline) {
      this.logger.warn("Skipping content embedding backfill — model not loaded")
      return
    }

    this.logger.log("Starting content embedding backfill...")

    // Find content without embeddings
    const unembedded = await this.contentRepository
      .createQueryBuilder("content")
      .leftJoin(ContentEmbedding, "ce", "ce.contentId = content.id")
      .where("ce.id IS NULL")
      .andWhere("content.isActive = :isActive", { isActive: true })
      .andWhere("content.sortOrder = :sortOrder", { sortOrder: 0 })
      .take(200) // Process in batches
      .getMany()

    let count = 0
    for (const content of unembedded) {
      await this.embedContent(content.id)
      count++
    }

    this.logger.log(`Content embedding backfill complete: ${count} items`)
  }

  /**
   * Backfill: generate embeddings for all users without embeddings.
   * Runs once daily at 4am.
   */
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async backfillUserEmbeddings() {
    if (!this.pipeline) {
      this.logger.warn("Skipping user embedding backfill — model not loaded")
      return
    }

    this.logger.log("Starting user embedding backfill...")

    const unembedded = await this.userRepository
      .createQueryBuilder("user")
      .leftJoin(UserEmbedding, "ue", "ue.userId = user.id")
      .where("ue.id IS NULL")
      .andWhere("user.isActive = :isActive", { isActive: true })
      .take(200)
      .getMany()

    let count = 0
    for (const user of unembedded) {
      await this.embedUser(user.id)
      count++
    }

    this.logger.log(`User embedding backfill complete: ${count} items`)
  }

  /**
   * Build text representation of content for embedding.
   */
  private buildContentText(content: Content): string {
    const parts: string[] = []
    if (content.caption) parts.push(content.caption)
    if (content.hashtags?.length) parts.push(content.hashtags.join(" "))
    // AI-generated text from media analysis (Whisper transcription + BLIP captioning).
    // These fields are populated asynchronously after upload by MediaAnalysisService.
    if ((content as any).transcription) parts.push((content as any).transcription)
    if ((content as any).aiDescription) parts.push((content as any).aiDescription)
    if (content.contentType) parts.push(content.contentType)
    return parts.join(" ").slice(0, 512) // Truncate for model input limit
  }

  /**
   * Build text representation of user for embedding.
   */
  private buildUserText(user: User): string {
    const parts: string[] = []
    if (user.displayName) parts.push(user.displayName)
    if (user.bio) parts.push(user.bio)
    if (user.interests?.length) parts.push(user.interests.join(" "))
    return parts.join(" ").slice(0, 512)
  }

  /**
   * Find content similar to a given content item using embeddings.
   */
  async findSimilarContent(contentId: string, limit = 10): Promise<{ contentId: string; similarity: number }[]> {
    const sourceEmbedding = await this.getContentEmbedding(contentId)
    if (!sourceEmbedding) return []

    // Get all content embeddings (in production, use pgvector for this)
    const allEmbeddings = await this.contentEmbeddingRepository.find()

    const similarities = allEmbeddings
      .filter((ce) => ce.contentId !== contentId)
      .map((ce) => ({
        contentId: ce.contentId,
        similarity: this.cosineSimilarity(sourceEmbedding, JSON.parse(ce.embedding)),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)

    return similarities
  }

  /**
   * Find users similar to a given user using embeddings.
   */
  async findSimilarUsers(userId: string, limit = 10): Promise<{ userId: string; similarity: number }[]> {
    const sourceEmbedding = await this.getUserEmbedding(userId)
    if (!sourceEmbedding) return []

    const allEmbeddings = await this.userEmbeddingRepository.find()

    const similarities = allEmbeddings
      .filter((ue) => ue.userId !== userId)
      .map((ue) => ({
        userId: ue.userId,
        similarity: this.cosineSimilarity(sourceEmbedding, JSON.parse(ue.embedding)),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)

    return similarities
  }

  /**
   * Search content by semantic similarity to a query string.
   */
  async semanticSearch(query: string, limit = 20): Promise<{ contentId: string; similarity: number }[]> {
    const queryEmbedding = await this.generateEmbedding(query)
    if (!queryEmbedding) return []

    const allEmbeddings = await this.contentEmbeddingRepository.find()

    return allEmbeddings
      .map((ce) => ({
        contentId: ce.contentId,
        similarity: this.cosineSimilarity(queryEmbedding, JSON.parse(ce.embedding)),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
  }

  /**
   * Search users by semantic similarity to a query string.
   */
  async semanticUserSearch(query: string, limit = 20): Promise<{ userId: string; similarity: number }[]> {
    const queryEmbedding = await this.generateEmbedding(query)
    if (!queryEmbedding) return []

    const allEmbeddings = await this.userEmbeddingRepository.find()

    return allEmbeddings
      .map((ue) => ({
        userId: ue.userId,
        similarity: this.cosineSimilarity(queryEmbedding, JSON.parse(ue.embedding)),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
  }

  /**
   * Check if the embedding model is ready.
   */
  isModelReady(): boolean {
    return this.pipeline !== null
  }
}
