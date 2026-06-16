import { Controller, Get, Param, Query, UseGuards, Request } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { DiscoveryService } from "./discovery.service"

@ApiTags("AI - Discovery")
@Controller("ai/discovery")
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get("similar-creators")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get similar creators to the current user" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getSimilarCreators(@Request() req, @Query("limit") limit?: number) {
    return this.discoveryService.getSimilarCreators(req.user.id, limit)
  }

  @Get("similar-creators/:userId")
  @ApiOperation({ summary: "Get similar creators to a specific user" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getSimilarCreatorsForUser(@Param("userId") userId: string, @Query("limit") limit?: number) {
    return this.discoveryService.getSimilarCreators(userId, limit)
  }

  @Get("for-you")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get personalized 'For You' feed" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getForYouFeed(@Request() req, @Query("page") page?: number, @Query("limit") limit?: number) {
    return this.discoveryService.getForYouFeed(req.user.id, page, limit)
  }
}
