/**
 * CategorizationController
 *
 * Exposes endpoints for AI-powered content categorization.
 * Supports both raw text categorization and categorization by content ID
 * (which uses the full enriched text: caption + hashtags + transcription + AI description).
 *
 * This controller does NOT handle media analysis — that is MediaAnalysisService's job.
 */
import { Controller, Post, Get, Body, Param } from "@nestjs/common"
import { ApiTags, ApiOperation } from "@nestjs/swagger"
import { CategorizationService } from "./categorization.service"

@ApiTags("AI - Categorization")
@Controller("ai/categorize")
export class CategorizationController {
  constructor(private readonly categorizationService: CategorizationService) {}

  @Post()
  @ApiOperation({ summary: "Categorize text content into predefined categories" })
  async categorize(@Body() body: { text: string; topK?: number }) {
    return this.categorizationService.categorize(body.text, body.topK)
  }

  @Post("content/:id")
  @ApiOperation({ summary: "Categorize a content item using all available enriched text" })
  async categorizeContent(@Param("id") id: string) {
    return this.categorizationService.categorizeByContentId(id)
  }

  @Get("categories")
  @ApiOperation({ summary: "Get list of available categories" })
  getCategories() {
    return this.categorizationService.getCategories()
  }
}
