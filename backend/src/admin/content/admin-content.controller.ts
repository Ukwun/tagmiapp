import { Controller, Get, Patch, Post, Delete, Param, Body, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { AdminGuard } from "../../auth/guards/admin.guard"
import { AdminContentService } from "./admin-content.service"
import { ContentSearchQueryDto, BulkContentActionDto } from "./dto/admin-content.dto"

@ApiTags("Admin - Content")
@Controller("admin/content")
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminContentController {
  constructor(private readonly contentService: AdminContentService) {}

  @Get()
  @ApiOperation({ summary: "List all content with filters" })
  async getContent(@Query() query: ContentSearchQueryDto) {
    return this.contentService.getContent(query)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get content detail with interactions and comments" })
  async getContentDetail(@Param("id") id: string) {
    return this.contentService.getContentDetail(id)
  }

  @Patch(":id/active")
  @ApiOperation({ summary: "Toggle content active status" })
  async toggleActive(@Param("id") id: string, @Body() body: { isActive: boolean }) {
    return this.contentService.toggleContentActive(id, body.isActive)
  }

  @Post("bulk")
  @ApiOperation({ summary: "Bulk activate/deactivate content by post IDs" })
  async bulkAction(@Body() dto: BulkContentActionDto) {
    return this.contentService.bulkContentAction(dto)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update content (caption, isActive)" })
  async updateContent(
    @Param("id") id: string,
    @Body() body: { caption?: string; isActive?: boolean },
  ) {
    return this.contentService.updateContent(id, body)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft-delete content (deactivate all slides)" })
  async deleteContent(@Param("id") id: string) {
    return this.contentService.deleteContent(id)
  }

  @Get("users/:userId/preferences")
  @ApiOperation({ summary: "View user's category preferences for feed personalization" })
  async getUserPreferences(@Param("userId") userId: string) {
    return this.contentService.getUserPreferences(userId)
  }

  @Get("users/:userId/feed-preview")
  @ApiOperation({ summary: "Preview user's personalized feed (first 20 posts)" })
  async getUserFeedPreview(@Param("userId") userId: string, @Query("limit") limit?: string) {
    return this.contentService.getUserFeedPreview(userId, Number(limit) || 20)
  }
}
