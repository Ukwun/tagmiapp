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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminEngagementService = void 0;
const common_1 = require("@nestjs/common");
const content_repository_1 = require("../../content/repositories/content.repository");
const content_interaction_repository_1 = require("../../content/repositories/content-interaction.repository");
const engagement_signal_repository_1 = require("../../content/repositories/engagement-signal.repository");
const hashtag_stat_repository_1 = require("../../ai/trending/repositories/hashtag-stat.repository");
let AdminEngagementService = class AdminEngagementService {
    constructor(contentRepo, interactionRepo, signalRepo, hashtagStatRepo) {
        this.contentRepo = contentRepo;
        this.interactionRepo = interactionRepo;
        this.signalRepo = signalRepo;
        this.hashtagStatRepo = hashtagStatRepo;
    }
    async getMetrics() {
        const [interactionBreakdown, signalStats, contentMetrics] = await Promise.all([
            this.interactionRepo
                .createQueryBuilder("i")
                .select("i.type", "type")
                .addSelect("COUNT(*)", "count")
                .groupBy("i.type")
                .getRawMany(),
            this.signalRepo
                .createQueryBuilder("s")
                .select("COUNT(*)", "totalSignals")
                .addSelect("AVG(s.dwellTimeMs)", "avgDwellTimeMs")
                .addSelect("AVG(s.mediaProgress)", "avgMediaProgress")
                .addSelect("AVG(s.scrollDepth)", "avgScrollDepth")
                .getRawOne(),
            this.contentRepo
                .createQueryBuilder("c")
                .select("AVG(c.completionRate)", "avgCompletionRate")
                .addSelect("AVG(c.avgWatchTime)", "avgWatchTime")
                .addSelect("AVG(c.avgDwellTime)", "avgDwellTime")
                .addSelect("AVG(c.engagementScore)", "avgEngagementScore")
                .where("c.sortOrder = :so AND c.isActive = :ia", { so: 0, ia: true })
                .getRawOne(),
        ]);
        const interactions = {};
        for (const i of interactionBreakdown)
            interactions[i.type] = Number(i.count);
        return {
            interactions,
            totalInteractions: Object.values(interactions).reduce((a, b) => a + b, 0),
            signals: {
                total: Number(signalStats?.totalSignals || 0),
                avgDwellTimeMs: Number(signalStats?.avgDwellTimeMs || 0),
                avgMediaProgress: Number(signalStats?.avgMediaProgress || 0),
                avgScrollDepth: Number(signalStats?.avgScrollDepth || 0),
            },
            content: {
                avgCompletionRate: Number(contentMetrics?.avgCompletionRate || 0),
                avgWatchTime: Number(contentMetrics?.avgWatchTime || 0),
                avgDwellTime: Number(contentMetrics?.avgDwellTime || 0),
                avgEngagementScore: Number(contentMetrics?.avgEngagementScore || 0),
            },
        };
    }
    async getTopContent(period, limit = 20) {
        const qb = this.contentRepo
            .createQueryBuilder("c")
            .leftJoinAndSelect("c.user", "user")
            .where("c.sortOrder = :so AND c.isActive = :ia", { so: 0, ia: true });
        if (period && period !== "all") {
            const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
            const cutoff = new Date(Date.now() - days * 86400000);
            qb.andWhere("c.createdAt >= :cutoff", { cutoff });
        }
        const data = await qb
            .orderBy("c.engagementScore", "DESC")
            .take(limit)
            .getMany();
        return data.map((c) => ({
            id: c.id,
            postId: c.postId,
            contentType: c.contentType,
            caption: c.caption,
            user: c.user
                ? { id: c.user.id, username: c.user.username, displayName: c.user.displayName, avatarUrl: c.user.avatarUrl }
                : null,
            viewCount: c.viewCount,
            likeCount: c.likeCount,
            commentCount: c.commentCount,
            engagementScore: c.engagementScore,
            completionRate: c.completionRate,
            createdAt: c.createdAt,
        }));
    }
    async getContentTypeBreakdown() {
        const breakdown = await this.contentRepo
            .createQueryBuilder("c")
            .select("c.contentType", "type")
            .addSelect("COUNT(*)", "count")
            .addSelect("AVG(c.engagementScore)", "avgEngagement")
            .addSelect("AVG(c.viewCount)", "avgViews")
            .addSelect("AVG(c.likeCount)", "avgLikes")
            .where("c.sortOrder = :so", { so: 0 })
            .groupBy("c.contentType")
            .getRawMany();
        return breakdown.map((b) => ({
            type: b.type,
            count: Number(b.count),
            avgEngagement: Number(b.avgEngagement || 0),
            avgViews: Number(b.avgViews || 0),
            avgLikes: Number(b.avgLikes || 0),
        }));
    }
    async getTrendingHashtags(limit = 20) {
        return this.hashtagStatRepo.find({
            order: { trendScore: "DESC" },
            take: limit,
        });
    }
};
exports.AdminEngagementService = AdminEngagementService;
exports.AdminEngagementService = AdminEngagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [content_repository_1.ContentRepository,
        content_interaction_repository_1.ContentInteractionRepository,
        engagement_signal_repository_1.EngagementSignalRepository,
        hashtag_stat_repository_1.HashtagStatRepository])
], AdminEngagementService);
//# sourceMappingURL=admin-engagement.service.js.map