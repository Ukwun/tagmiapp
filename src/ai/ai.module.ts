import { Module } from "@nestjs/common"
import { ScheduleModule } from "@nestjs/schedule"
import { ScoringModule } from "./scoring/scoring.module"
import { TrendingModule } from "./trending/trending.module"
import { AnalyticsModule } from "./analytics/analytics.module"
import { DiscoveryModule } from "./discovery/discovery.module"
import { EmbeddingsModule } from "./embeddings/embeddings.module"
import { SearchModule } from "./search/search.module"
import { RecommendationsModule } from "./recommendations/recommendations.module"
import { CategorizationModule } from "./categorization/categorization.module"
import { GenerationModule } from "./generation/generation.module"
import { MediaAnalysisModule } from "./media-analysis/media-analysis.module"

@Module({
  imports: [
    ScheduleModule.forRoot(),
    // Phase 1: Smart Algorithms
    ScoringModule,
    TrendingModule,
    AnalyticsModule,
    DiscoveryModule,
    // Phase 2: Embeddings & Semantic Search
    EmbeddingsModule,
    SearchModule,
    RecommendationsModule,
    // Phase 3: Categorization & Hashtag Suggestions
    CategorizationModule,
    GenerationModule,
    // Phase 4: Media Analysis (Whisper transcription + BLIP captioning)
    MediaAnalysisModule,
  ],
})
export class AiModule {}
