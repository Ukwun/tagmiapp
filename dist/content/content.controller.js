"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const content_service_1 = require("./content.service");
const create_content_dto_1 = require("./dto/create-content.dto");
const create_post_dto_1 = require("./dto/create-post.dto");
const update_content_dto_1 = require("./dto/update-content.dto");
const create_comment_dto_1 = require("./dto/create-comment.dto");
const create_engagement_signals_dto_1 = require("./dto/create-engagement-signals.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const optional_jwt_auth_guard_1 = require("../auth/guards/optional-jwt-auth.guard");
let ContentController = class ContentController {
    constructor(contentService) {
        this.contentService = contentService;
    }
    async create(req, createContentDto, file) {
        if (!file) {
            throw new common_1.BadRequestException("File is required");
        }
        return this.contentService.create(req.user.id, createContentDto, file);
    }
    async createPost(req, createPostDto, uploadedFiles) {
        const files = uploadedFiles?.files;
        const musicFiles = uploadedFiles?.backgroundMusic;
        const thumbnailFiles = uploadedFiles?.thumbnails;
        return this.contentService.createPost(req.user.id, createPostDto, files, musicFiles, thumbnailFiles);
    }
    async getFeed(page, limit, req) {
        const userId = req?.user?.id;
        return this.contentService.getFeed(userId, page, limit);
    }
    async getPostsFeed(req, page, limit, category, userId, followingOnly, sort, trendingDays) {
        const currentUserId = req.user?.id || null;
        return this.contentService.findAllPosts(page, limit, category, userId, currentUserId, followingOnly, sort, trendingDays ? Number(trendingDays) : undefined);
    }
    async getNewPostsCount(since) {
        return this.contentService.getNewPostsCount(since);
    }
    async getPostInteractors(postId, type, page, limit) {
        return this.contentService.getPostInteractors(postId, type, page, limit);
    }
    async search(req, query, type, page, limit) {
        console.log(`[ContentController.search] User ${req.user?.id} searching for: "${query}", type: ${type}`);
        return this.contentService.search(query, req.user.id, type, page, limit);
    }
    async getBookmarks(req, page, limit) {
        return this.contentService.getBookmarkedPosts(req.user.id, page, limit);
    }
    async findAll(page, limit, category, userId) {
        return this.contentService.findAll(page, limit, category, userId);
    }
    async downloadSlide(slideId, res) {
        return this.contentService.downloadSlideSegment(slideId, res);
    }
    async findOne(id, req) {
        const content = await this.contentService.findOne(id);
        const userId = req?.user?.id;
        const firstSlideId = content.slides?.[0]?.id || id;
        try {
            await this.contentService.viewContent(firstSlideId, userId);
        }
        catch {
        }
        const interactions = await this.contentService.getContentInteractions(firstSlideId, userId);
        return {
            ...content,
            isLiked: interactions?.isLiked || false,
            isBookmarked: interactions?.isBookmarked || false,
        };
    }
    async updatePost(postId, req, body, uploadedFiles) {
        const mediaFiles = uploadedFiles?.files;
        const musicFiles = uploadedFiles?.backgroundMusic;
        return this.contentService.updatePost(postId, req.user.id, body, musicFiles, mediaFiles);
    }
    async update(id, req, updateContentDto) {
        return this.contentService.update(id, req.user.id, updateContentDto);
    }
    async remove(id, req) {
        return this.contentService.remove(id, req.user.id);
    }
    async likeContent(id, req) {
        return this.contentService.likeContent(id, req.user.id);
    }
    async addComment(id, req, createCommentDto) {
        return this.contentService.addComment(id, req.user.id, createCommentDto);
    }
    async getComments(req, id, page, limit) {
        const userId = req.user.id;
        return this.contentService.getComments(id, userId, page, limit);
    }
    async interactWithContent(id, req, body) {
        return this.contentService.interactWithContent(id, req.user.id, body.type);
    }
    async deleteComment(commentId, req) {
        return this.contentService.deleteComment(commentId, req.user.id);
    }
    async likeComment(commentId, req) {
        return this.contentService.likeComment(commentId, req.user.id);
    }
    async trackViews(req, body) {
        if (!body.postIds?.length)
            return { tracked: 0, views: {} };
        const result = await this.contentService.trackBatchViews(body.postIds, req.user.id);
        return result;
    }
    async trackEngagementSignals(req, body) {
        if (!body.signals?.length)
            return { tracked: 0, metrics: {} };
        if (!req.user?.id) {
            console.warn("[trackEngagementSignals] Called without valid userId, req.user:", req.user);
            return { tracked: 0, metrics: {} };
        }
        return this.contentService.trackEngagementSignals(req.user.id, body.signals);
    }
};
exports.ContentController = ContentController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    (0, swagger_1.ApiConsumes)("multipart/form-data"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Upload new content (single slide)" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Content uploaded successfully" }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_content_dto_1.CreateContentDto, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "create", null);
__decorate([
    (0, common_1.Post)("posts"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: "files", maxCount: 10 },
        { name: "backgroundMusic", maxCount: 10 },
        { name: "thumbnails", maxCount: 10 },
    ])),
    (0, swagger_1.ApiConsumes)("multipart/form-data"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Create multi-slide post (text or media)" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Post created successfully" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Bad request - invalid files or data" }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_post_dto_1.CreatePostDto, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "createPost", null);
__decorate([
    (0, common_1.Get)("feed"),
    (0, swagger_1.ApiOperation)({ summary: "Get personalized content feed" }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getFeed", null);
__decorate([
    (0, common_1.Get)("posts/feed"),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Get posts feed with multi-slide support" }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "category", required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: "userId", required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: "followingOnly", required: false, type: Boolean }),
    (0, swagger_1.ApiQuery)({ name: "sort", required: false, enum: ["recent", "ranked"], description: "Sort by recency or engagement score" }),
    (0, swagger_1.ApiQuery)({ name: "trendingDays", required: false, type: Number, description: "Only return posts from the last N days, sorted by engagement. Skips freshness injection." }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('category')),
    __param(4, (0, common_1.Query)('userId')),
    __param(5, (0, common_1.Query)('followingOnly')),
    __param(6, (0, common_1.Query)('sort')),
    __param(7, (0, common_1.Query)('trendingDays')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, Boolean, String, Number]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getPostsFeed", null);
__decorate([
    (0, common_1.Get)("posts/new-count"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Check how many new posts exist since a given timestamp" }),
    (0, swagger_1.ApiQuery)({ name: "since", required: true, type: String, description: "ISO timestamp" }),
    __param(0, (0, common_1.Query)('since')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getNewPostsCount", null);
__decorate([
    (0, common_1.Get)("posts/:postId/interactors"),
    (0, swagger_1.ApiOperation)({ summary: "Get users who interacted with a post (likes, bookmarks, shares)" }),
    (0, swagger_1.ApiQuery)({ name: "type", required: true, enum: ["like", "bookmark", "share"] }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getPostInteractors", null);
__decorate([
    (0, common_1.Get)("search"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Search posts by caption, hashtags, or user" }),
    (0, swagger_1.ApiQuery)({ name: "q", required: true, type: String }),
    (0, swagger_1.ApiQuery)({ name: "type", required: false, enum: ["posts", "users", "hashtags", "all"] }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('q')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "search", null);
__decorate([
    (0, common_1.Get)("bookmarks"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Get user's bookmarked posts" }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getBookmarks", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Get all public content" }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "category", required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: "userId", required: false, type: String }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('category')),
    __param(3, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("slides/:slideId/download"),
    (0, swagger_1.ApiOperation)({ summary: "Download a video slide segment (trimmed from full video)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Video segment stream" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Slide not found" }),
    __param(0, (0, common_1.Param)('slideId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "downloadSlide", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Get content by ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Content retrieved successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Content not found" }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)("posts/:postId"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: "files", maxCount: 10 },
        { name: "backgroundMusic", maxCount: 10 },
    ])),
    (0, swagger_1.ApiConsumes)("multipart/form-data"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Update a full post (all slides)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Post updated successfully" }),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "updatePost", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Update a single content slide" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Content updated successfully" }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_content_dto_1.UpdateContentDto]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Delete content" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Content deleted successfully" }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(":id/like"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Like or unlike content" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Content like status updated" }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "likeContent", null);
__decorate([
    (0, common_1.Post)(":id/comments"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Add comment to content" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Comment added successfully" }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_comment_dto_1.CreateCommentDto]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "addComment", null);
__decorate([
    (0, common_1.Get)(":id/comments"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Get content comments" }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getComments", null);
__decorate([
    (0, common_1.Post)(":id/interact"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Interact with content (like, bookmark, share)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Interaction recorded successfully" }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "interactWithContent", null);
__decorate([
    (0, common_1.Delete)("comments/:commentId"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Delete a comment (author or post owner only)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Comment deleted successfully" }),
    __param(0, (0, common_1.Param)('commentId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "deleteComment", null);
__decorate([
    (0, common_1.Post)("comments/:commentId/like"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Like or unlike a comment" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Comment like status updated" }),
    __param(0, (0, common_1.Param)('commentId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "likeComment", null);
__decorate([
    (0, common_1.Post)("views/batch"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Track views for multiple posts (called when posts enter viewport)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Views recorded" }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "trackViews", null);
__decorate([
    (0, common_1.Post)("engagement-signals"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Track engagement signals (media progress, dwell time, slide completion)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Signals recorded" }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_engagement_signals_dto_1.CreateEngagementSignalsDto]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "trackEngagementSignals", null);
exports.ContentController = ContentController = __decorate([
    (0, swagger_1.ApiTags)("Content"),
    (0, common_1.Controller)("content"),
    __metadata("design:paramtypes", [content_service_1.ContentService])
], ContentController);
//# sourceMappingURL=content.controller.js.map