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
exports.AdminEngagementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../../auth/guards/admin.guard");
const admin_engagement_service_1 = require("./admin-engagement.service");
let AdminEngagementController = class AdminEngagementController {
    constructor(engagementService) {
        this.engagementService = engagementService;
    }
    async getMetrics() {
        return this.engagementService.getMetrics();
    }
    async getTopContent(period, limit) {
        return this.engagementService.getTopContent(period, limit ? parseInt(limit) : 20);
    }
    async getTypeBreakdown() {
        return this.engagementService.getContentTypeBreakdown();
    }
    async getTrendingHashtags(limit) {
        return this.engagementService.getTrendingHashtags(limit ? parseInt(limit) : 20);
    }
};
exports.AdminEngagementController = AdminEngagementController;
__decorate([
    (0, common_1.Get)("metrics"),
    (0, swagger_1.ApiOperation)({ summary: "Get platform-wide engagement metrics" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminEngagementController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)("top-content"),
    (0, swagger_1.ApiOperation)({ summary: "Get top content by engagement score" }),
    (0, swagger_1.ApiQuery)({ name: "period", required: false, enum: ["7d", "30d", "90d", "all"] }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    __param(0, (0, common_1.Query)("period")),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminEngagementController.prototype, "getTopContent", null);
__decorate([
    (0, common_1.Get)("type-breakdown"),
    (0, swagger_1.ApiOperation)({ summary: "Get engagement breakdown by content type" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminEngagementController.prototype, "getTypeBreakdown", null);
__decorate([
    (0, common_1.Get)("trending-hashtags"),
    (0, swagger_1.ApiOperation)({ summary: "Get trending hashtags" }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    __param(0, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminEngagementController.prototype, "getTrendingHashtags", null);
exports.AdminEngagementController = AdminEngagementController = __decorate([
    (0, swagger_1.ApiTags)("Admin - Engagement"),
    (0, common_1.Controller)("admin/engagement"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [admin_engagement_service_1.AdminEngagementService])
], AdminEngagementController);
//# sourceMappingURL=admin-engagement.controller.js.map