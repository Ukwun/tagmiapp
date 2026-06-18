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
var TrendingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrendingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const content_entity_1 = require("../../content/entities/content.entity");
const hashtag_stat_entity_1 = require("./hashtag-stat.entity");
let TrendingService = TrendingService_1 = class TrendingService {
    constructor(contentRepository, hashtagStatRepository) {
        this.contentRepository = contentRepository;
        this.hashtagStatRepository = hashtagStatRepository;
        this.logger = new common_1.Logger(TrendingService_1.name);
    }
    async recalculateTrendingHashtags() {
        this.logger.log("Recalculating trending hashtags...");
        try {
            const recentPosts = await this.contentRepository
                .createQueryBuilder("content")
                .select("content.hashtags")
                .where("content.isActive = :isActive", { isActive: true })
                .andWhere("content.hashtags IS NOT NULL")
                .andWhere("content.createdAt > NOW() - INTERVAL '7 days'")
                .getMany();
            const hashtagCounts = new Map();
            const now = Date.now();
            const oneHour = 60 * 60 * 1000;
            const sixHours = 6 * oneHour;
            const twentyFourHours = 24 * oneHour;
            for (const post of recentPosts) {
                if (!post.hashtags || !Array.isArray(post.hashtags))
                    continue;
                const postAge = now - new Date(post.createdAt).getTime();
                for (const tag of post.hashtags) {
                    const normalized = tag.toLowerCase().replace(/^#/, "");
                    if (!normalized)
                        continue;
                    if (!hashtagCounts.has(normalized)) {
                        hashtagCounts.set(normalized, { total: 0, recent1h: 0, recent6h: 0, recent24h: 0 });
                    }
                    const counts = hashtagCounts.get(normalized);
                    counts.total++;
                    if (postAge <= oneHour)
                        counts.recent1h++;
                    if (postAge <= sixHours)
                        counts.recent6h++;
                    if (postAge <= twentyFourHours)
                        counts.recent24h++;
                }
            }
            for (const [hashtag, counts] of hashtagCounts) {
                const baseline = Math.max(counts.total / 7, 1);
                const recentVelocity = counts.recent1h * 24;
                const trendScore = (recentVelocity / baseline) * Math.log2(counts.total + 1);
                await this.hashtagStatRepository.upsert({
                    hashtag,
                    postCount: counts.total,
                    recentPostCount1h: counts.recent1h,
                    recentPostCount6h: counts.recent6h,
                    recentPostCount24h: counts.recent24h,
                    trendScore,
                    updatedAt: new Date(),
                }, ["hashtag"]);
            }
            this.logger.log(`Trending hashtags updated: ${hashtagCounts.size} hashtags`);
        }
        catch (error) {
            this.logger.error("Failed to recalculate trending hashtags", error.stack);
        }
    }
    async getTrendingHashtags(limit = 20) {
        const limitNum = Number(limit) || 20;
        return this.hashtagStatRepository.find({
            where: {},
            order: { trendScore: "DESC" },
            take: limitNum,
        });
    }
    async getHashtagStats(hashtag) {
        const normalized = hashtag.toLowerCase().replace(/^#/, "");
        return this.hashtagStatRepository.findOne({ where: { hashtag: normalized } });
    }
};
exports.TrendingService = TrendingService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_30_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TrendingService.prototype, "recalculateTrendingHashtags", null);
exports.TrendingService = TrendingService = TrendingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(content_entity_1.Content)),
    __param(1, (0, typeorm_1.InjectRepository)(hashtag_stat_entity_1.HashtagStat)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TrendingService);
//# sourceMappingURL=trending.service.js.map