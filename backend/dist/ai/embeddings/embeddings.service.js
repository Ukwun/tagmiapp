"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EmbeddingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const content_embedding_entity_1 = require("./content-embedding.entity");
const user_embedding_entity_1 = require("./user-embedding.entity");
const content_entity_1 = require("../../content/entities/content.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let EmbeddingsService = EmbeddingsService_1 = class EmbeddingsService {
    constructor(contentEmbeddingRepository, userEmbeddingRepository, contentRepository, userRepository) {
        this.contentEmbeddingRepository = contentEmbeddingRepository;
        this.userEmbeddingRepository = userEmbeddingRepository;
        this.contentRepository = contentRepository;
        this.userRepository = userRepository;
        this.logger = new common_1.Logger(EmbeddingsService_1.name);
        this.pipeline = null;
        this.isModelLoading = false;
    }
    async onModuleInit() {
        this.loadModel().catch((err) => {
            this.logger.warn("Failed to load embedding model on startup — will retry on first use", err.message);
        });
    }
    async loadModel() {
        if (this.pipeline || this.isModelLoading)
            return;
        this.isModelLoading = true;
        try {
            this.logger.log("Loading embedding model (all-MiniLM-L6-v2)...");
            const { pipeline } = await Promise.resolve().then(() => __importStar(require("@xenova/transformers")));
            this.pipeline = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
            this.logger.log("Embedding model loaded successfully");
        }
        catch (error) {
            this.logger.error("Failed to load embedding model", error.message);
            this.pipeline = null;
        }
        finally {
            this.isModelLoading = false;
        }
    }
    async generateEmbedding(text) {
        if (!this.pipeline) {
            await this.loadModel();
        }
        if (!this.pipeline)
            return null;
        try {
            const output = await this.pipeline(text, { pooling: "mean", normalize: true });
            return Array.from(output.data);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error("Failed to generate embedding", message);
            return null;
        }
    }
    cosineSimilarity(a, b) {
        if (a.length !== b.length)
            return 0;
        let dot = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    async embedContent(contentId) {
        const content = await this.contentRepository.findOne({ where: { id: contentId } });
        if (!content)
            return;
        const text = this.buildContentText(content);
        const embedding = await this.generateEmbedding(text);
        if (!embedding)
            return;
        await this.contentEmbeddingRepository.upsert({ contentId, embedding: JSON.stringify(embedding) }, ["contentId"]);
    }
    async embedUser(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            return;
        const text = this.buildUserText(user);
        const embedding = await this.generateEmbedding(text);
        if (!embedding)
            return;
        await this.userEmbeddingRepository.upsert({ userId, embedding: JSON.stringify(embedding) }, ["userId"]);
    }
    async getContentEmbedding(contentId) {
        const record = await this.contentEmbeddingRepository.findOne({ where: { contentId } });
        if (record)
            return JSON.parse(record.embedding);
        return null;
    }
    async getUserEmbedding(userId) {
        const record = await this.userEmbeddingRepository.findOne({ where: { userId } });
        if (record)
            return JSON.parse(record.embedding);
        return null;
    }
    async backfillContentEmbeddings() {
        if (!this.pipeline) {
            this.logger.warn("Skipping content embedding backfill — model not loaded");
            return;
        }
        this.logger.log("Starting content embedding backfill...");
        const unembedded = await this.contentRepository
            .createQueryBuilder("content")
            .leftJoin(content_embedding_entity_1.ContentEmbedding, "ce", "ce.contentId = content.id")
            .where("ce.id IS NULL")
            .andWhere("content.isActive = :isActive", { isActive: true })
            .andWhere("content.sortOrder = :sortOrder", { sortOrder: 0 })
            .take(200)
            .getMany();
        let count = 0;
        for (const content of unembedded) {
            await this.embedContent(content.id);
            count++;
        }
        this.logger.log(`Content embedding backfill complete: ${count} items`);
    }
    async backfillUserEmbeddings() {
        if (!this.pipeline) {
            this.logger.warn("Skipping user embedding backfill — model not loaded");
            return;
        }
        this.logger.log("Starting user embedding backfill...");
        const unembedded = await this.userRepository
            .createQueryBuilder("user")
            .leftJoin(user_embedding_entity_1.UserEmbedding, "ue", "ue.userId = user.id")
            .where("ue.id IS NULL")
            .andWhere("user.isActive = :isActive", { isActive: true })
            .take(200)
            .getMany();
        let count = 0;
        for (const user of unembedded) {
            await this.embedUser(user.id);
            count++;
        }
        this.logger.log(`User embedding backfill complete: ${count} items`);
    }
    buildContentText(content) {
        const parts = [];
        if (content.caption)
            parts.push(content.caption);
        if (content.hashtags?.length)
            parts.push(content.hashtags.join(" "));
        if (content.transcription)
            parts.push(content.transcription);
        if (content.aiDescription)
            parts.push(content.aiDescription);
        if (content.contentType)
            parts.push(content.contentType);
        return parts.join(" ").slice(0, 512);
    }
    buildUserText(user) {
        const parts = [];
        if (user.displayName)
            parts.push(user.displayName);
        if (user.bio)
            parts.push(user.bio);
        if (user.interests?.length)
            parts.push(user.interests.join(" "));
        return parts.join(" ").slice(0, 512);
    }
    async findSimilarContent(contentId, limit = 10) {
        const sourceEmbedding = await this.getContentEmbedding(contentId);
        if (!sourceEmbedding)
            return [];
        const allEmbeddings = await this.contentEmbeddingRepository.find();
        const similarities = allEmbeddings
            .filter((ce) => ce.contentId !== contentId)
            .map((ce) => ({
            contentId: ce.contentId,
            similarity: this.cosineSimilarity(sourceEmbedding, JSON.parse(ce.embedding)),
        }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
        return similarities;
    }
    async findSimilarUsers(userId, limit = 10) {
        const sourceEmbedding = await this.getUserEmbedding(userId);
        if (!sourceEmbedding)
            return [];
        const allEmbeddings = await this.userEmbeddingRepository.find();
        const similarities = allEmbeddings
            .filter((ue) => ue.userId !== userId)
            .map((ue) => ({
            userId: ue.userId,
            similarity: this.cosineSimilarity(sourceEmbedding, JSON.parse(ue.embedding)),
        }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
        return similarities;
    }
    async semanticSearch(query, limit = 20) {
        const queryEmbedding = await this.generateEmbedding(query);
        if (!queryEmbedding)
            return [];
        const allEmbeddings = await this.contentEmbeddingRepository.find();
        return allEmbeddings
            .map((ce) => ({
            contentId: ce.contentId,
            similarity: this.cosineSimilarity(queryEmbedding, JSON.parse(ce.embedding)),
        }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
    }
    async semanticUserSearch(query, limit = 20) {
        const queryEmbedding = await this.generateEmbedding(query);
        if (!queryEmbedding)
            return [];
        const allEmbeddings = await this.userEmbeddingRepository.find();
        return allEmbeddings
            .map((ue) => ({
            userId: ue.userId,
            similarity: this.cosineSimilarity(queryEmbedding, JSON.parse(ue.embedding)),
        }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
    }
    isModelReady() {
        return this.pipeline !== null;
    }
};
exports.EmbeddingsService = EmbeddingsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_3AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmbeddingsService.prototype, "backfillContentEmbeddings", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_4AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmbeddingsService.prototype, "backfillUserEmbeddings", null);
exports.EmbeddingsService = EmbeddingsService = EmbeddingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(content_embedding_entity_1.ContentEmbedding)),
    __param(1, (0, typeorm_1.InjectRepository)(user_embedding_entity_1.UserEmbedding)),
    __param(2, (0, typeorm_1.InjectRepository)(content_entity_1.Content)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], EmbeddingsService);
//# sourceMappingURL=embeddings.service.js.map