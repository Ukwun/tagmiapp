import { Controller, Get, Param, Query, UseGuards, Request } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { RecommendationsService } from "./recommendations.service"
import { EmbeddingsService } from "../embeddings/embeddings.service"

@ApiTags("AI - Recommendations")
@Controller("ai/recommendations")
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  @Get("similar/:contentId")
  @ApiOperation({ summary: "Get content similar to a given post" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getSimilarContent(@Param("contentId") contentId: string, @Query("limit") limit?: number) {
    return this.recommendationsService.getSimilarContent(contentId, limit)
  }

  @Get("feed")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get AI-powered recommended feed" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getRecommendedFeed(@Request() req, @Query("page") page?: number, @Query("limit") limit?: number) {
    return this.recommendationsService.getRecommendedFeed(req.user.id, page, limit)
  }

  @Get("status")
  @ApiOperation({ summary: "Check if AI model is loaded and ready" })
  async getStatus() {
    return { modelReady: this.embeddingsService.isModelReady() }
  }

  @Get("backfill/content")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Trigger content embedding backfill manually" })
  async triggerContentBackfill() {
    await this.embeddingsService.backfillContentEmbeddings()
    return { message: "Content embedding backfill triggered" }
  }

  @Get("backfill/users")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Trigger user embedding backfill manually" })
  async triggerUserBackfill() {
    await this.embeddingsService.backfillUserEmbeddings()
    return { message: "User embedding backfill triggered" }
  }
}
