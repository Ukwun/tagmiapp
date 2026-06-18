/**
 * MediaAnalysisBackfillService
 *
 * Processes existing content that was uploaded before the media analysis
 * pipeline existed. Runs as a daily cron at 2am (before the 3am embedding
 * backfill) so that descriptions and categories are available when
 * embeddings are regenerated.
 *
 * Uses Claude Vision API through MediaAnalysisService — each content item
 * gets a description + categories in a single API call.
 *
 * Processes content in small batches with delays between batches to stay
 * within API rate limits and avoid overwhelming the system.
 *
 * This service does NOT handle new uploads — ContentService fires analysis
 * immediately for new posts.
 */
import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, IsNull, Not } from "typeorm"
import { Content } from "../../content/entities/content.entity"
import { MediaAnalysisService } from "./media-analysis.service"
import { EmbeddingsService } from "../embeddings/embeddings.service"

@Injectable()
export class MediaAnalysisBackfillService {
  private readonly logger = new Logger(MediaAnalysisBackfillService.name)
  private isRunning = false

  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    private readonly mediaAnalysisService: MediaAnalysisService,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  /**
   * Daily backfill at 2am — processes media content that has no AI analysis yet.
   * Runs before the 3am embedding backfill so enriched text is ready for embedding.
   */
  @Cron("0 2 * * *")
  async runBackfill(): Promise<void> {
    if (this.isRunning) {
      this.logger.log("Backfill already running — skipping")
      return
    }

    this.isRunning = true
    const BATCH_SIZE = 10
    const DELAY_BETWEEN_BATCHES_MS = 3000
    let totalProcessed = 0

    try {
      const totalPending = await this.contentRepository.count({
        where: [
          { contentType: "video", aiDescription: IsNull(), mediaUrl: Not(IsNull()) },
          { contentType: "image", aiDescription: IsNull(), mediaUrl: Not(IsNull()) },
          { contentType: "audio", aiDescription: IsNull(), mediaUrl: Not(IsNull()) },
        ],
      })

      if (totalPending === 0) {
        this.logger.log("Media analysis backfill: nothing to process")
        return
      }

      this.logger.log(`Media analysis backfill starting: ${totalPending} items to process`)

      while (totalProcessed < totalPending) {
        const batch = await this.contentRepository.find({
          where: [
            { contentType: "video", aiDescription: IsNull(), mediaUrl: Not(IsNull()) },
            { contentType: "image", aiDescription: IsNull(), mediaUrl: Not(IsNull()) },
            { contentType: "audio", aiDescription: IsNull(), mediaUrl: Not(IsNull()) },
          ],
          take: BATCH_SIZE,
          order: { createdAt: "DESC" },
        })

        if (batch.length === 0) break

        for (const content of batch) {
          try {
            const result = await this.mediaAnalysisService.analyzeContent(
              content.contentType as "video" | "image" | "audio",
              content.mediaUrl,
              content.caption,
            )

            // Claude returns description + categories together
            const updates: Partial<Content> = {}
            if (result.transcription) updates.transcription = result.transcription
            if (result.aiDescription) updates.aiDescription = result.aiDescription
            if (result.categories && content.sortOrder === 0) {
              updates.categories = result.categories
            }

            if (Object.keys(updates).length > 0) {
              await this.contentRepository.update(content.id, updates)

              // Re-embed with enriched text
              if (content.sortOrder === 0) {
                await this.embeddingsService.embedContent(content.id).catch(() => {})
              }
            }

            totalProcessed++
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            this.logger.warn(`Backfill failed for content ${content.id}: ${message}`)
            await this.contentRepository.update(content.id, {
              aiDescription: "",
            }).catch(() => {})
            totalProcessed++
          }
        }

        this.logger.log(`Backfill progress: ${totalProcessed}/${totalPending} items processed`)

        if (totalProcessed < totalPending) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS))
        }
      }

      this.logger.log(`Media analysis backfill complete: ${totalProcessed} items processed`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const stack = error instanceof Error ? error.stack : undefined
      this.logger.error(`Backfill crashed: ${message}`, stack)
    } finally {
      this.isRunning = false
    }
  }
}
