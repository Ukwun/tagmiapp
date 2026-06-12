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
exports.RecommendationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const recommendations_service_1 = require("./recommendations.service");
const embeddings_service_1 = require("../embeddings/embeddings.service");
let RecommendationsController = class RecommendationsController {
    constructor(recommendationsService, embeddingsService) {
        this.recommendationsService = recommendationsService;
        this.embeddingsService = embeddingsService;
    }
    async getSimilarContent(contentId, limit) {
        return this.recommendationsService.getSimilarContent(contentId, limit);
    }
    async getRecommendedFeed(req, page, limit) {
        return this.recommendationsService.getRecommendedFeed(req.user.id, page, limit);
    }
    async getStatus() {
        return { modelReady: this.embeddingsService.isModelReady() };
    }
    async triggerContentBackfill() {
        await this.embeddingsService.backfillContentEmbeddings();
        return { message: "Content embedding backfill triggered" };
    }
    async triggerUserBackfill() {
        await this.embeddingsService.backfillUserEmbeddings();
        return { message: "User embedding backfill triggered" };
    }
};
exports.RecommendationsController = RecommendationsController;
__decorate([
    (0, common_1.Get)("similar/:contentId"),
    (0, swagger_1.ApiOperation)({ summary: "Get content similar to a given post" }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    __param(0, (0, common_1.Param)("contentId")),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "getSimilarContent", null);
__decorate([
    (0, common_1.Get)("feed"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Get AI-powered recommended feed" }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)("page")),
    __param(2, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "getRecommendedFeed", null);
__decorate([
    (0, common_1.Get)("status"),
    (0, swagger_1.ApiOperation)({ summary: "Check if AI model is loaded and ready" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)("backfill/content"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Trigger content embedding backfill manually" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "triggerContentBackfill", null);
__decorate([
    (0, common_1.Get)("backfill/users"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Trigger user embedding backfill manually" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "triggerUserBackfill", null);
exports.RecommendationsController = RecommendationsController = __decorate([
    (0, swagger_1.ApiTags)("AI - Recommendations"),
    (0, common_1.Controller)("ai/recommendations"),
    __metadata("design:paramtypes", [recommendations_service_1.RecommendationsService,
        embeddings_service_1.EmbeddingsService])
], RecommendationsController);
//# sourceMappingURL=recommendations.controller.js.map