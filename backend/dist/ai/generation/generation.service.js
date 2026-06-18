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
exports.GenerationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const embeddings_service_1 = require("../embeddings/embeddings.service");
const content_entity_1 = require("../../content/entities/content.entity");
const content_embedding_entity_1 = require("../embeddings/content-embedding.entity");
let GenerationService = class GenerationService {
    constructor(embeddingsService, contentRepository, contentEmbeddingRepository) {
        this.embeddingsService = embeddingsService;
        this.contentRepository = contentRepository;
        this.contentEmbeddingRepository = contentEmbeddingRepository;
    }
    async suggestHashtags(caption, limit = 10) {
        if (!this.embeddingsService.isModelReady()) {
            return this.fallbackHashtagSuggestion(caption);
        }
        const similar = await this.embeddingsService.semanticSearch(caption, 30);
        if (similar.length === 0) {
            return this.fallbackHashtagSuggestion(caption);
        }
        const contentIds = similar.map((s) => s.contentId);
        const contents = await this.contentRepository
            .createQueryBuilder("content")
            .select(["content.id", "content.hashtags"])
            .where("content.id IN (:...ids)", { ids: contentIds })
            .getMany();
        const hashtagScores = new Map();
        const similarityMap = new Map(similar.map((s) => [s.contentId, s.similarity]));
        for (const content of contents) {
            if (!content.hashtags?.length)
                continue;
            const weight = similarityMap.get(content.id) || 0;
            for (const tag of content.hashtags) {
                const normalized = tag.toLowerCase().replace(/^#/, "");
                if (normalized) {
                    hashtagScores.set(normalized, (hashtagScores.get(normalized) || 0) + weight);
                }
            }
        }
        return Array.from(hashtagScores.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([tag]) => tag);
    }
    async fallbackHashtagSuggestion(caption) {
        const existing = caption.match(/#\w+/g)?.map((h) => h.replace("#", "").toLowerCase()) || [];
        const stopWords = new Set(["this", "that", "with", "from", "have", "been", "were", "they", "their", "about", "would", "could", "should", "your", "just", "like", "more", "some", "than", "them", "what", "when", "will", "very", "much", "also", "only", "into", "over", "such", "really", "want", "know", "make", "made", "good", "look"]);
        const words = caption
            .replace(/#\w+/g, "")
            .replace(/[^a-zA-Z\s]/g, "")
            .split(/\s+/)
            .filter((w) => w.length > 3 && !stopWords.has(w.toLowerCase()))
            .map((w) => w.toLowerCase());
        const captionTags = [...new Set([...existing, ...words])];
        try {
            const recentContent = await this.contentRepository
                .createQueryBuilder("content")
                .select("content.hashtags")
                .where("content.hashtags IS NOT NULL")
                .orderBy("content.createdAt", "DESC")
                .limit(50)
                .getMany();
            const tagCounts = new Map();
            for (const c of recentContent) {
                if (!c.hashtags?.length)
                    continue;
                for (const tag of c.hashtags) {
                    const normalized = tag.toLowerCase().replace(/^#/, "");
                    if (normalized && normalized.length > 2) {
                        tagCounts.set(normalized, (tagCounts.get(normalized) || 0) + 1);
                    }
                }
            }
            const popularTags = Array.from(tagCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([tag]) => tag);
            const combined = [...captionTags];
            for (const tag of popularTags) {
                if (!combined.includes(tag))
                    combined.push(tag);
            }
            return combined.slice(0, 10);
        }
        catch {
            return captionTags.slice(0, 10);
        }
    }
};
exports.GenerationService = GenerationService;
exports.GenerationService = GenerationService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(content_entity_1.Content)),
    __param(2, (0, typeorm_1.InjectRepository)(content_embedding_entity_1.ContentEmbedding)),
    __metadata("design:paramtypes", [embeddings_service_1.EmbeddingsService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], GenerationService);
//# sourceMappingURL=generation.service.js.map