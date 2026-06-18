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
var CategorizationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategorizationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const embeddings_service_1 = require("../embeddings/embeddings.service");
const content_entity_1 = require("../../content/entities/content.entity");
const categories_constant_1 = require("../../common/constants/categories.constant");
let CategorizationService = CategorizationService_1 = class CategorizationService {
    constructor(embeddingsService, contentRepository) {
        this.embeddingsService = embeddingsService;
        this.contentRepository = contentRepository;
        this.logger = new common_1.Logger(CategorizationService_1.name);
        this.categoryEmbeddings = new Map();
    }
    async onModuleInit() {
        this.precomputeCategoryEmbeddings().catch((err) => {
            this.logger.warn("Failed to precompute category embeddings — will retry on first use", err.message);
        });
    }
    async precomputeCategoryEmbeddings() {
        let retries = 0;
        while (!this.embeddingsService.isModelReady() && retries < 30) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            retries++;
        }
        if (!this.embeddingsService.isModelReady()) {
            this.logger.warn("Embedding model not ready after waiting — skipping category precomputation");
            return;
        }
        this.logger.log("Pre-computing category embeddings...");
        for (const category of categories_constant_1.TALENT_CATEGORIES) {
            const embedding = await this.embeddingsService.generateEmbedding(category);
            if (embedding) {
                this.categoryEmbeddings.set(category, embedding);
            }
        }
        this.logger.log(`Pre-computed ${this.categoryEmbeddings.size} category embeddings`);
    }
    async categorize(text, topK = 3) {
        if (this.categoryEmbeddings.size === 0) {
            await this.precomputeCategoryEmbeddings();
        }
        if (this.categoryEmbeddings.size === 0) {
            return [];
        }
        const textEmbedding = await this.embeddingsService.generateEmbedding(text);
        if (!textEmbedding)
            return [];
        const scores = Array.from(this.categoryEmbeddings.entries())
            .map(([category, catEmbedding]) => ({
            category,
            confidence: this.embeddingsService.cosineSimilarity(textEmbedding, catEmbedding),
        }))
            .sort((a, b) => b.confidence - a.confidence);
        return scores.slice(0, topK);
    }
    async categorizeByContentId(contentId) {
        const content = await this.contentRepository.findOne({ where: { id: contentId } });
        if (!content) {
            throw new common_1.NotFoundException("Content not found");
        }
        const parts = [];
        if (content.caption)
            parts.push(content.caption);
        if (content.hashtags?.length)
            parts.push(content.hashtags.join(" "));
        if (content.transcription)
            parts.push(content.transcription);
        if (content.aiDescription)
            parts.push(content.aiDescription);
        const text = parts.join(" ").trim();
        if (!text)
            return [];
        const categories = await this.categorize(text, 3);
        if (categories.length > 0) {
            await this.contentRepository.update(contentId, { categories });
        }
        return categories;
    }
    getCategories() {
        return [...categories_constant_1.TALENT_CATEGORIES];
    }
};
exports.CategorizationService = CategorizationService;
exports.CategorizationService = CategorizationService = CategorizationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(content_entity_1.Content)),
    __metadata("design:paramtypes", [embeddings_service_1.EmbeddingsService,
        typeorm_2.Repository])
], CategorizationService);
//# sourceMappingURL=categorization.service.js.map