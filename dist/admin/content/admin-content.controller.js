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
exports.AdminContentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../../auth/guards/admin.guard");
const admin_content_service_1 = require("./admin-content.service");
const admin_content_dto_1 = require("./dto/admin-content.dto");
let AdminContentController = class AdminContentController {
    constructor(contentService) {
        this.contentService = contentService;
    }
    async getContent(query) {
        return this.contentService.getContent(query);
    }
    async getContentDetail(id) {
        return this.contentService.getContentDetail(id);
    }
    async toggleActive(id, body) {
        return this.contentService.toggleContentActive(id, body.isActive);
    }
    async bulkAction(dto) {
        return this.contentService.bulkContentAction(dto);
    }
    async updateContent(id, body) {
        return this.contentService.updateContent(id, body);
    }
    async deleteContent(id) {
        return this.contentService.deleteContent(id);
    }
    async getUserPreferences(userId) {
        return this.contentService.getUserPreferences(userId);
    }
    async getUserFeedPreview(userId, limit) {
        return this.contentService.getUserFeedPreview(userId, Number(limit) || 20);
    }
};
exports.AdminContentController = AdminContentController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "List all content with filters" }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_content_dto_1.ContentSearchQueryDto]),
    __metadata("design:returntype", Promise)
], AdminContentController.prototype, "getContent", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Get content detail with interactions and comments" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminContentController.prototype, "getContentDetail", null);
__decorate([
    (0, common_1.Patch)(":id/active"),
    (0, swagger_1.ApiOperation)({ summary: "Toggle content active status" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminContentController.prototype, "toggleActive", null);
__decorate([
    (0, common_1.Post)("bulk"),
    (0, swagger_1.ApiOperation)({ summary: "Bulk activate/deactivate content by post IDs" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_content_dto_1.BulkContentActionDto]),
    __metadata("design:returntype", Promise)
], AdminContentController.prototype, "bulkAction", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Update content (caption, isActive)" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminContentController.prototype, "updateContent", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Soft-delete content (deactivate all slides)" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminContentController.prototype, "deleteContent", null);
__decorate([
    (0, common_1.Get)("users/:userId/preferences"),
    (0, swagger_1.ApiOperation)({ summary: "View user's category preferences for feed personalization" }),
    __param(0, (0, common_1.Param)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminContentController.prototype, "getUserPreferences", null);
__decorate([
    (0, common_1.Get)("users/:userId/feed-preview"),
    (0, swagger_1.ApiOperation)({ summary: "Preview user's personalized feed (first 20 posts)" }),
    __param(0, (0, common_1.Param)("userId")),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminContentController.prototype, "getUserFeedPreview", null);
exports.AdminContentController = AdminContentController = __decorate([
    (0, swagger_1.ApiTags)("Admin - Content"),
    (0, common_1.Controller)("admin/content"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [admin_content_service_1.AdminContentService])
], AdminContentController);
//# sourceMappingURL=admin-content.controller.js.map