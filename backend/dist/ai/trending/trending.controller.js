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
exports.TrendingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const trending_service_1 = require("./trending.service");
const scoring_service_1 = require("../scoring/scoring.service");
let TrendingController = class TrendingController {
    constructor(trendingService, scoringService) {
        this.trendingService = trendingService;
        this.scoringService = scoringService;
    }
    async getTrendingHashtags(limit) {
        return this.trendingService.getTrendingHashtags(limit);
    }
    async getHashtagStats(hashtag) {
        return this.trendingService.getHashtagStats(hashtag);
    }
    async getTrendingPosts(page, limit) {
        return this.scoringService.getTrendingPosts(page, limit);
    }
};
exports.TrendingController = TrendingController;
__decorate([
    (0, common_1.Get)("hashtags"),
    (0, swagger_1.ApiOperation)({ summary: "Get trending hashtags" }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    __param(0, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TrendingController.prototype, "getTrendingHashtags", null);
__decorate([
    (0, common_1.Get)("hashtags/:hashtag"),
    (0, swagger_1.ApiOperation)({ summary: "Get stats for a specific hashtag" }),
    __param(0, (0, common_1.Param)("hashtag")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrendingController.prototype, "getHashtagStats", null);
__decorate([
    (0, common_1.Get)("posts"),
    (0, swagger_1.ApiOperation)({ summary: "Get trending posts by engagement score" }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    __param(0, (0, common_1.Query)("page")),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], TrendingController.prototype, "getTrendingPosts", null);
exports.TrendingController = TrendingController = __decorate([
    (0, swagger_1.ApiTags)("AI - Trending"),
    (0, common_1.Controller)("ai/trending"),
    __metadata("design:paramtypes", [trending_service_1.TrendingService,
        scoring_service_1.ScoringService])
], TrendingController);
//# sourceMappingURL=trending.controller.js.map