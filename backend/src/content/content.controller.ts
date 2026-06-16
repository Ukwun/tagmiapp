import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  BadRequestException,
  Request,
  Body,
  Res,
  UploadedFile,
  UploadedFiles,
} from "@nestjs/common"
import type { Response } from "express"
import { FileInterceptor, FileFieldsInterceptor } from "@nestjs/platform-express"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiQuery } from "@nestjs/swagger"
import { ContentService } from "./content.service"
import { CreateContentDto } from "./dto/create-content.dto"
import { CreatePostDto } from "./dto/create-post.dto"
import { UpdateContentDto } from "./dto/update-content.dto"
import { CreateCommentDto } from "./dto/create-comment.dto"
import { CreateEngagementSignalsDto } from "./dto/create-engagement-signals.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { OptionalJwtAuthGuard } from "../auth/guards/optional-jwt-auth.guard"
import type { Express } from "express"

@ApiTags("Content")
@Controller("content")
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Upload new content (single slide)" })
  @ApiResponse({ status: 201, description: "Content uploaded successfully" })
  async create(@Request() req, @Body() createContentDto: CreateContentDto, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("File is required")
    }

    return this.contentService.create(req.user.id, createContentDto, file)
  }

  @Post("posts")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: "files", maxCount: 10 },
    { name: "backgroundMusic", maxCount: 10 },
    { name: "thumbnails", maxCount: 10 },
  ]))
  @ApiConsumes("multipart/form-data")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create multi-slide post (text or media)" })
  @ApiResponse({ status: 201, description: "Post created successfully" })
  @ApiResponse({ status: 400, description: "Bad request - invalid files or data" })
  async createPost(
    @Request() req,
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() uploadedFiles?: { files?: Express.Multer.File[]; backgroundMusic?: Express.Multer.File[]; thumbnails?: Express.Multer.File[] }
  ) {
    const files = uploadedFiles?.files
    const musicFiles = uploadedFiles?.backgroundMusic
    const thumbnailFiles = uploadedFiles?.thumbnails
    return this.contentService.createPost(req.user.id, createPostDto, files, musicFiles, thumbnailFiles)
  }

  @Get("feed")
  @ApiOperation({ summary: "Get personalized content feed" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getFeed(@Query('page') page?: number, @Query('limit') limit?: number, @Request() req?) {
    const userId = req?.user?.id
    return this.contentService.getFeed(userId, page, limit)
  }

  @Get("posts/feed")
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get posts feed with multi-slide support" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "category", required: false, type: String })
  @ApiQuery({ name: "userId", required: false, type: String })
  @ApiQuery({ name: "followingOnly", required: false, type: Boolean })
  @ApiQuery({ name: "sort", required: false, enum: ["recent", "ranked"], description: "Sort by recency or engagement score" })
  @ApiQuery({ name: "trendingDays", required: false, type: Number, description: "Only return posts from the last N days, sorted by engagement. Skips freshness injection." })
  async getPostsFeed(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('userId') userId?: string,
    @Query('followingOnly') followingOnly?: boolean,
    @Query('sort') sort?: "recent" | "ranked",
    @Query('trendingDays') trendingDays?: number,
  ) {
    const currentUserId = req.user?.id || null
    return this.contentService.findAllPosts(page, limit, category, userId, currentUserId, followingOnly, sort, trendingDays ? Number(trendingDays) : undefined)
  }

  @Get("posts/new-count")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Check how many new posts exist since a given timestamp" })
  @ApiQuery({ name: "since", required: true, type: String, description: "ISO timestamp" })
  async getNewPostsCount(
    @Query('since') since: string,
  ) {
    return this.contentService.getNewPostsCount(since)
  }

  @Get("posts/:postId/interactors")
  @ApiOperation({ summary: "Get users who interacted with a post (likes, bookmarks, shares)" })
  @ApiQuery({ name: "type", required: true, enum: ["like", "bookmark", "share"] })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getPostInteractors(
    @Param('postId') postId: string,
    @Query('type') type: "like" | "bookmark" | "share",
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.contentService.getPostInteractors(postId, type, page, limit)
  }

  @Get("search")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Search posts by caption, hashtags, or user" })
  @ApiQuery({ name: "q", required: true, type: String })
  @ApiQuery({ name: "type", required: false, enum: ["posts", "users", "hashtags", "all"] })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async search(
    @Request() req,
    @Query('q') query: string,
    @Query('type') type?: "posts" | "users" | "hashtags" | "all",
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    console.log(`[ContentController.search] User ${req.user?.id} searching for: "${query}", type: ${type}`)
    return this.contentService.search(query, req.user.id, type, page, limit)
  }

  @Get("bookmarks")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user's bookmarked posts" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getBookmarks(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.contentService.getBookmarkedPosts(req.user.id, page, limit)
  }

  @Get()
  @ApiOperation({ summary: "Get all public content" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "category", required: false, type: String })
  @ApiQuery({ name: "userId", required: false, type: String })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('userId') userId?: string,
  ) {
    return this.contentService.findAll(page, limit, category, userId)
  }

  @Get("slides/:slideId/download")
  @ApiOperation({ summary: "Download a video slide segment (trimmed from full video)" })
  @ApiResponse({ status: 200, description: "Video segment stream" })
  @ApiResponse({ status: 404, description: "Slide not found" })
  async downloadSlide(@Param('slideId') slideId: string, @Res() res: Response) {
    return this.contentService.downloadSlideSegment(slideId, res)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get content by ID" })
  @ApiResponse({ status: 200, description: "Content retrieved successfully" })
  @ApiResponse({ status: 404, description: "Content not found" })
  async findOne(@Param('id') id: string, @Request() req) {
    const content = await this.contentService.findOne(id)
    const userId = req?.user?.id

    // Use the first slide id for tracking views/interactions
    const firstSlideId = content.slides?.[0]?.id || id
    try {
      await this.contentService.viewContent(firstSlideId, userId)
    } catch {
      // Ignore view tracking errors
    }

    const interactions = await this.contentService.getContentInteractions(firstSlideId, userId)

    return {
      ...content,
      isLiked: interactions?.isLiked || false,
      isBookmarked: interactions?.isBookmarked || false,
    }
  }

  @Patch("posts/:postId")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: "files", maxCount: 10 },
    { name: "backgroundMusic", maxCount: 10 },
  ]))
  @ApiConsumes("multipart/form-data")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a full post (all slides)" })
  @ApiResponse({ status: 200, description: "Post updated successfully" })
  async updatePost(
    @Param('postId') postId: string,
    @Request() req,
    @Body() body: any,
    @UploadedFiles() uploadedFiles?: { files?: Express.Multer.File[]; backgroundMusic?: Express.Multer.File[] }
  ) {
    const mediaFiles = uploadedFiles?.files
    const musicFiles = uploadedFiles?.backgroundMusic
    return this.contentService.updatePost(postId, req.user.id, body, musicFiles, mediaFiles)
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a single content slide" })
  @ApiResponse({ status: 200, description: "Content updated successfully" })
  async update(@Param('id') id: string, @Request() req, @Body() updateContentDto: UpdateContentDto) {
    return this.contentService.update(id, req.user.id, updateContentDto)
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete content" })
  @ApiResponse({ status: 200, description: "Content deleted successfully" })
  async remove(@Param('id') id: string, @Request() req) {
    return this.contentService.remove(id, req.user.id)
  }

  @Post(":id/like")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Like or unlike content" })
  @ApiResponse({ status: 200, description: "Content like status updated" })
  async likeContent(@Param('id') id: string, @Request() req) {
    return this.contentService.likeContent(id, req.user.id)
  }

  @Post(":id/comments")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Add comment to content" })
  @ApiResponse({ status: 201, description: "Comment added successfully" })
  async addComment(@Param('id') id: string, @Request() req, @Body() createCommentDto: CreateCommentDto) {
    return this.contentService.addComment(id, req.user.id, createCommentDto)
  }

  @Get(":id/comments")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get content comments" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getComments(@Request() req, @Param('id') id: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    const userId = req.user.id
    return this.contentService.getComments(id, userId, page, limit)
  }

  @Post(":id/interact")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Interact with content (like, bookmark, share)" })
  @ApiResponse({ status: 200, description: "Interaction recorded successfully" })
  async interactWithContent(@Param('id') id: string, @Request() req, @Body() body: { type: "like" | "bookmark" | "share" }) {
    return this.contentService.interactWithContent(id, req.user.id, body.type)
  }

  @Delete("comments/:commentId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a comment (author or post owner only)" })
  @ApiResponse({ status: 200, description: "Comment deleted successfully" })
  async deleteComment(@Param('commentId') commentId: string, @Request() req) {
    return this.contentService.deleteComment(commentId, req.user.id)
  }

  @Post("comments/:commentId/like")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Like or unlike a comment" })
  @ApiResponse({ status: 200, description: "Comment like status updated" })
  async likeComment(@Param('commentId') commentId: string, @Request() req) {
    return this.contentService.likeComment(commentId, req.user.id)
  }

  @Post("views/batch")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Track views for multiple posts (called when posts enter viewport)" })
  @ApiResponse({ status: 200, description: "Views recorded" })
  async trackViews(@Request() req, @Body() body: { postIds: string[] }) {
    if (!body.postIds?.length) return { tracked: 0, views: {} }
    const result = await this.contentService.trackBatchViews(body.postIds, req.user.id)
    return result
  }

  @Post("engagement-signals")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Track engagement signals (media progress, dwell time, slide completion)" })
  @ApiResponse({ status: 200, description: "Signals recorded" })
  async trackEngagementSignals(@Request() req, @Body() body: CreateEngagementSignalsDto) {
    if (!body.signals?.length) return { tracked: 0, metrics: {} }

    // Validate userId exists and is valid
    if (!req.user?.id) {
      console.warn("[trackEngagementSignals] Called without valid userId, req.user:", req.user)
      return { tracked: 0, metrics: {} }
    }

    return this.contentService.trackEngagementSignals(req.user.id, body.signals)
  }
}
