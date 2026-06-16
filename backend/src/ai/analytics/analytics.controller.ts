import { Controller, Get, Param, Query, UseGuards, Request } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { AnalyticsService } from "./analytics.service"

@ApiTags("AI - Analytics")
@Controller("ai/analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("best-times")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get optimal posting times based on follower activity" })
  async getBestPostingTimes(@Request() req) {
    return this.analyticsService.getBestPostingTimes(req.user.id)
  }

  @Get("best-times/:userId")
  @ApiOperation({ summary: "Get optimal posting times for a specific user" })
  async getBestPostingTimesForUser(@Param("userId") userId: string) {
    return this.analyticsService.getBestPostingTimes(userId)
  }

  @Get("engagement")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get engagement analytics for current user" })
  @ApiQuery({ name: "days", required: false, type: Number })
  async getEngagementAnalytics(@Request() req, @Query("days") days?: number) {
    return this.analyticsService.getEngagementAnalytics(req.user.id, days)
  }

  @Get("engagement/:userId")
  @ApiOperation({ summary: "Get engagement analytics for a specific user" })
  @ApiQuery({ name: "days", required: false, type: Number })
  async getEngagementAnalyticsForUser(@Param("userId") userId: string, @Query("days") days?: number) {
    return this.analyticsService.getEngagementAnalytics(userId, days)
  }
}
