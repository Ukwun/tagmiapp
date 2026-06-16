/**
 * MediaAnalysisModule
 *
 * Provides AI-powered media content analysis using Claude Vision API.
 * Handles image description, video frame analysis, and content categorization
 * in a single API call per content item.
 *
 * Used by ContentService to analyze uploads in the background,
 * and by the backfill job to process existing content.
 */
import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { MediaAnalysisService } from "./media-analysis.service"
import { MediaAnalysisBackfillService } from "./media-analysis-backfill.service"
import { Content } from "../../content/entities/content.entity"
import { EmbeddingsModule } from "../embeddings/embeddings.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([Content]),
    EmbeddingsModule,
  ],
  providers: [MediaAnalysisService, MediaAnalysisBackfillService],
  exports: [MediaAnalysisService],
})
export class MediaAnalysisModule {}
