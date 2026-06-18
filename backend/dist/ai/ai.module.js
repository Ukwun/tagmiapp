"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const scoring_module_1 = require("./scoring/scoring.module");
const trending_module_1 = require("./trending/trending.module");
const analytics_module_1 = require("./analytics/analytics.module");
const discovery_module_1 = require("./discovery/discovery.module");
const embeddings_module_1 = require("./embeddings/embeddings.module");
const search_module_1 = require("./search/search.module");
const recommendations_module_1 = require("./recommendations/recommendations.module");
const categorization_module_1 = require("./categorization/categorization.module");
const generation_module_1 = require("./generation/generation.module");
const media_analysis_module_1 = require("./media-analysis/media-analysis.module");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            scoring_module_1.ScoringModule,
            trending_module_1.TrendingModule,
            analytics_module_1.AnalyticsModule,
            discovery_module_1.DiscoveryModule,
            embeddings_module_1.EmbeddingsModule,
            search_module_1.SearchModule,
            recommendations_module_1.RecommendationsModule,
            categorization_module_1.CategorizationModule,
            generation_module_1.GenerationModule,
            media_analysis_module_1.MediaAnalysisModule,
        ],
    })
], AiModule);
//# sourceMappingURL=ai.module.js.map