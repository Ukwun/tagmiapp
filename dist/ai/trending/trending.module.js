"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrendingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const trending_service_1 = require("./trending.service");
const trending_controller_1 = require("./trending.controller");
const hashtag_stat_entity_1 = require("./hashtag-stat.entity");
const content_entity_1 = require("../../content/entities/content.entity");
const scoring_module_1 = require("../scoring/scoring.module");
const hashtag_stat_repository_1 = require("./repositories/hashtag-stat.repository");
let TrendingModule = class TrendingModule {
};
exports.TrendingModule = TrendingModule;
exports.TrendingModule = TrendingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([hashtag_stat_entity_1.HashtagStat, content_entity_1.Content]),
            scoring_module_1.ScoringModule,
        ],
        controllers: [trending_controller_1.TrendingController],
        providers: [trending_service_1.TrendingService, hashtag_stat_repository_1.HashtagStatRepository],
        exports: [trending_service_1.TrendingService, hashtag_stat_repository_1.HashtagStatRepository],
    })
], TrendingModule);
//# sourceMappingURL=trending.module.js.map