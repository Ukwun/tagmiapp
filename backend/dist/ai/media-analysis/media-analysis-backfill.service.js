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
var MediaAnalysisBackfillService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaAnalysisBackfillService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const content_entity_1 = require("../../content/entities/content.entity");
const media_analysis_service_1 = require("./media-analysis.service");
const embeddings_service_1 = require("../embeddings/embeddings.service");
let MediaAnalysisBackfillService = MediaAnalysisBackfillService_1 = class MediaAnalysisBackfillService {
    constructor(contentRepository, mediaAnalysisService, embeddingsService) {
        this.contentRepository = contentRepository;
        this.mediaAnalysisService = mediaAnalysisService;
        this.embeddingsService = embeddingsService;
        this.logger = new common_1.Logger(MediaAnalysisBackfillService_1.name);
        this.isRunning = false;
    }
    async runBackfill() {
        if (this.isRunning) {
            this.logger.log("Backfill already running — skipping");
            return;
        }
        this.isRunning = true;
        const BATCH_SIZE = 10;
        const DELAY_BETWEEN_BATCHES_MS = 3000;
        let totalProcessed = 0;
        try {
            const totalPending = await this.contentRepository.count({
                where: [
                    { contentType: "video", aiDescription: (0, typeorm_2.IsNull)(), mediaUrl: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) },
                    { contentType: "image", aiDescription: (0, typeorm_2.IsNull)(), mediaUrl: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) },
                    { contentType: "audio", aiDescription: (0, typeorm_2.IsNull)(), mediaUrl: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) },
                ],
            });
            if (totalPending === 0) {
                this.logger.log("Media analysis backfill: nothing to process");
                return;
            }
            this.logger.log(`Media analysis backfill starting: ${totalPending} items to process`);
            while (totalProcessed < totalPending) {
                const batch = await this.contentRepository.find({
                    where: [
                        { contentType: "video", aiDescription: (0, typeorm_2.IsNull)(), mediaUrl: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) },
                        { contentType: "image", aiDescription: (0, typeorm_2.IsNull)(), mediaUrl: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) },
                        { contentType: "audio", aiDescription: (0, typeorm_2.IsNull)(), mediaUrl: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) },
                    ],
                    take: BATCH_SIZE,
                    order: { createdAt: "DESC" },
                });
                if (batch.length === 0)
                    break;
                for (const content of batch) {
                    try {
                        const result = await this.mediaAnalysisService.analyzeContent(content.contentType, content.mediaUrl, content.caption);
                        const updates = {};
                        if (result.transcription)
                            updates.transcription = result.transcription;
                        if (result.aiDescription)
                            updates.aiDescription = result.aiDescription;
                        if (result.categories && content.sortOrder === 0) {
                            updates.categories = result.categories;
                        }
                        if (Object.keys(updates).length > 0) {
                            await this.contentRepository.update(content.id, updates);
                            if (content.sortOrder === 0) {
                                await this.embeddingsService.embedContent(content.id).catch(() => { });
                            }
                        }
                        totalProcessed++;
                    }
                    catch (error) {
                        const message = error instanceof Error ? error.message : String(error);
                        this.logger.warn(`Backfill failed for content ${content.id}: ${message}`);
                        await this.contentRepository.update(content.id, {
                            aiDescription: "",
                        }).catch(() => { });
                        totalProcessed++;
                    }
                }
                this.logger.log(`Backfill progress: ${totalProcessed}/${totalPending} items processed`);
                if (totalProcessed < totalPending) {
                    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
                }
            }
            this.logger.log(`Media analysis backfill complete: ${totalProcessed} items processed`);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const stack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Backfill crashed: ${message}`, stack);
        }
        finally {
            this.isRunning = false;
        }
    }
};
exports.MediaAnalysisBackfillService = MediaAnalysisBackfillService;
__decorate([
    (0, schedule_1.Cron)("0 2 * * *"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MediaAnalysisBackfillService.prototype, "runBackfill", null);
exports.MediaAnalysisBackfillService = MediaAnalysisBackfillService = MediaAnalysisBackfillService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(content_entity_1.Content)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        media_analysis_service_1.MediaAnalysisService,
        embeddings_service_1.EmbeddingsService])
], MediaAnalysisBackfillService);
//# sourceMappingURL=media-analysis-backfill.service.js.map