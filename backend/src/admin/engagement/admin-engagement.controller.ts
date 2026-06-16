import { Controller, Get, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from "@nestjs/swagger"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { AdminGuard } from "../../auth/guards/admin.guard"
import { AdminEngagementService } from "./admin-engagement.service"

@ApiTags("Admin - Engagement")
@Controller("admin/engagement")
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminEngagementController {
  constructor(private readonly engagementService: AdminEngagementService) {}

  @Get("metrics")
  @ApiOperation({ summary: "Get platform-wide engagement metrics" })
  async getMetrics() {
    return this.engagementService.getMetrics()
  }

  @Get("top-content")
  @ApiOperation({ summary: "Get top content by engagement score" })
  @ApiQuery({ name: "period", required: false, enum: ["7d", "30d", "90d", "all"] })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getTopContent(
    @Query("period") period?: string,
    @Query("limit") limit?: string,
  ) {
    return this.engagementService.getTopContent(period, limit ? parseInt(limit) : 20)
  }

  @Get("type-breakdown")
  @ApiOperation({ summary: "Get engagement breakdown by content type" })
  async getTypeBreakdown() {
    return this.engagementService.getContentTypeBreakdown()
  }

  @Get("trending-hashtags")
  @ApiOperation({ summary: "Get trending hashtags" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getTrendingHashtags(@Query("limit") limit?: string) {
    return this.engagementService.getTrendingHashtags(limit ? parseInt(limit) : 20)
  }
}
