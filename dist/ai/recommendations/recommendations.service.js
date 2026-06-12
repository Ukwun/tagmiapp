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
exports.RecommendationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const embeddings_service_1 = require("../embeddings/embeddings.service");
const content_entity_1 = require("../../content/entities/content.entity");
let RecommendationsService = class RecommendationsService {
    constructor(embeddingsService, contentRepository) {
        this.embeddingsService = embeddingsService;
        this.contentRepository = contentRepository;
    }
    async getSimilarContent(contentId, limit = 10) {
        const limitNum = Number(limit) || 10;
        if (!this.embeddingsService.isModelReady()) {
            return { data: [], modelReady: false };
        }
        const results = await this.embeddingsService.findSimilarContent(contentId, limitNum);
        if (results.length === 0)
            return { data: [] };
        const contentIds = results.map((r) => r.contentId);
        const contents = await this.contentRepository.find({
            where: { id: (0, typeorm_2.In)(contentIds), isActive: true },
            relations: ["user"],
        });
        const contentMap = new Map(contents.map((c) => [c.id, c]));
        const similarityMap = new Map(results.map((r) => [r.contentId, r.similarity]));
        const data = contentIds
            .map((id) => {
            const content = contentMap.get(id);
            if (!content)
                return null;
            return {
                postId: content.postId,
                userId: content.userId,
                user: content.user,
                caption: content.caption,
                hashtags: content.hashtags,
                contentType: content.contentType,
                mediaUrl: content.mediaUrl,
                thumbnailUrl: content.thumbnailUrl,
                similarity: similarityMap.get(id) || 0,
                likeCount: content.likeCount,
                commentCount: content.commentCount,
                createdAt: content.createdAt,
            };
        })
            .filter(Boolean);
        return { data };
    }
    async getRecommendedFeed(userId, page = 1, limit = 20) {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 20;
        if (!this.embeddingsService.isModelReady()) {
            return { data: [], total: 0, page: pageNum, limit: limitNum, modelReady: false };
        }
        const similarUsers = await this.embeddingsService.findSimilarUsers(userId, 20);
        if (similarUsers.length === 0) {
            return { data: [], total: 0, page: pageNum, limit: limitNum };
        }
        const similarUserIds = similarUsers.map((u) => u.userId);
        const [contents, total] = await this.contentRepository
            .createQueryBuilder("content")
            .leftJoinAndSelect("content.user", "user")
            .where("content.userId IN (:...userIds)", { userIds: similarUserIds })
            .andWhere("content.isActive = :isActive", { isActive: true })
            .andWhere("content.sortOrder = :sortOrder", { sortOrder: 0 })
            .andWhere("user.isActive = :userActive", { userActive: true })
            .orderBy("content.engagementScore", "DESC")
            .addOrderBy("content.createdAt", "DESC")
            .skip((pageNum - 1) * limitNum)
            .take(limitNum)
            .getManyAndCount();
        const data = contents.map((content) => ({
            postId: content.postId,
            userId: content.userId,
            user: content.user,
            caption: content.caption,
            hashtags: content.hashtags,
            contentType: content.contentType,
            mediaUrl: content.mediaUrl,
            thumbnailUrl: content.thumbnailUrl,
            engagementScore: content.engagementScore,
            viewCount: content.viewCount,
            likeCount: content.likeCount,
            commentCount: content.commentCount,
            createdAt: content.createdAt,
        }));
        return { data, total, page: pageNum, limit: limitNum };
    }
};
exports.RecommendationsService = RecommendationsService;
exports.RecommendationsService = RecommendationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(content_entity_1.Content)),
    __metadata("design:paramtypes", [embeddings_service_1.EmbeddingsService,
        typeorm_2.Repository])
], RecommendationsService);
//# sourceMappingURL=recommendations.service.js.map