"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaAnalysisModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const media_analysis_service_1 = require("./media-analysis.service");
const media_analysis_backfill_service_1 = require("./media-analysis-backfill.service");
const content_entity_1 = require("../../content/entities/content.entity");
const embeddings_module_1 = require("../embeddings/embeddings.module");
let MediaAnalysisModule = class MediaAnalysisModule {
};
exports.MediaAnalysisModule = MediaAnalysisModule;
exports.MediaAnalysisModule = MediaAnalysisModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([content_entity_1.Content]),
            embeddings_module_1.EmbeddingsModule,
        ],
        providers: [media_analysis_service_1.MediaAnalysisService, media_analysis_backfill_service_1.MediaAnalysisBackfillService],
        exports: [media_analysis_service_1.MediaAnalysisService],
    })
], MediaAnalysisModule);
//# sourceMappingURL=media-analysis.module.js.map