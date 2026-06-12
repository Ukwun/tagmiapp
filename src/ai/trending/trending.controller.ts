import { Controller, Get, Param, Query } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger"
import { TrendingService } from "./trending.service"
import { ScoringService } from "../scoring/scoring.service"

@ApiTags("AI - Trending")
@Controller("ai/trending")
export class TrendingController {
  constructor(
    private readonly trendingService: TrendingService,
    private readonly scoringService: ScoringService,
  ) {}

  @Get("hashtags")
  @ApiOperation({ summary: "Get trending hashtags" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getTrendingHashtags(@Query("limit") limit?: number) {
    return this.trendingService.getTrendingHashtags(limit)
  }

  @Get("hashtags/:hashtag")
  @ApiOperation({ summary: "Get stats for a specific hashtag" })
  async getHashtagStats(@Param("hashtag") hashtag: string) {
    return this.trendingService.getHashtagStats(hashtag)
  }

  @Get("posts")
  @ApiOperation({ summary: "Get trending posts by engagement score" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getTrendingPosts(@Query("page") page?: number, @Query("limit") limit?: number) {
    return this.scoringService.getTrendingPosts(page, limit)
  }
}
