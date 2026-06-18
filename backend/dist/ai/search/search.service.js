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
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const embeddings_service_1 = require("../embeddings/embeddings.service");
const content_entity_1 = require("../../content/entities/content.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let SearchService = class SearchService {
    constructor(embeddingsService, contentRepository, userRepository) {
        this.embeddingsService = embeddingsService;
        this.contentRepository = contentRepository;
        this.userRepository = userRepository;
    }
    async searchContent(query, page = 1, limit = 20) {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 20;
        if (!this.embeddingsService.isModelReady()) {
            return { data: [], total: 0, page: pageNum, limit: limitNum, modelReady: false };
        }
        const results = await this.embeddingsService.semanticSearch(query, pageNum * limitNum);
        const paged = results.slice((pageNum - 1) * limitNum, pageNum * limitNum);
        if (paged.length === 0) {
            return { data: [], total: results.length, page: pageNum, limit: limitNum };
        }
        const contentIds = paged.map((r) => r.contentId);
        const contents = await this.contentRepository.find({
            where: { id: (0, typeorm_2.In)(contentIds), isActive: true },
            relations: ["user"],
        });
        const contentMap = new Map(contents.map((c) => [c.id, c]));
        const similarityMap = new Map(paged.map((r) => [r.contentId, r.similarity]));
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
                viewCount: content.viewCount,
                likeCount: content.likeCount,
                commentCount: content.commentCount,
                createdAt: content.createdAt,
            };
        })
            .filter(Boolean);
        return { data, total: results.length, page: pageNum, limit: limitNum };
    }
    async searchTalent(query, page = 1, limit = 20) {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 20;
        if (!this.embeddingsService.isModelReady()) {
            return { data: [], total: 0, page: pageNum, limit: limitNum, modelReady: false };
        }
        const results = await this.embeddingsService.semanticUserSearch(query, pageNum * limitNum);
        const paged = results.slice((pageNum - 1) * limitNum, pageNum * limitNum);
        if (paged.length === 0) {
            return { data: [], total: results.length, page: pageNum, limit: limitNum };
        }
        const userIds = paged.map((r) => r.userId);
        const users = await this.userRepository.find({
            where: { id: (0, typeorm_2.In)(userIds), isActive: true },
        });
        const userMap = new Map(users.map((u) => [u.id, u]));
        const similarityMap = new Map(paged.map((r) => [r.userId, r.similarity]));
        const data = userIds
            .map((id) => {
            const user = userMap.get(id);
            if (!user)
                return null;
            return {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                bio: user.bio,
                followersCount: user.followersCount,
                isVerified: user.isVerified,
                similarity: similarityMap.get(id) || 0,
            };
        })
            .filter(Boolean);
        return { data, total: results.length, page: pageNum, limit: limitNum };
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(content_entity_1.Content)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [embeddings_service_1.EmbeddingsService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SearchService);
//# sourceMappingURL=search.service.js.map