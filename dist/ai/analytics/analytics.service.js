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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const content_entity_1 = require("../../content/entities/content.entity");
const content_interaction_entity_1 = require("../../content/entities/content-interaction.entity");
let AnalyticsService = class AnalyticsService {
    constructor(contentRepository, interactionRepository) {
        this.contentRepository = contentRepository;
        this.interactionRepository = interactionRepository;
    }
    async getBestPostingTimes(userId) {
        const result = await this.interactionRepository
            .createQueryBuilder("interaction")
            .select("EXTRACT(HOUR FROM interaction.createdAt)", "hour")
            .addSelect("EXTRACT(DOW FROM interaction.createdAt)", "dayOfWeek")
            .addSelect("COUNT(*)", "count")
            .innerJoin("interaction.content", "content")
            .where("content.userId = :userId", { userId })
            .andWhere("interaction.createdAt > NOW() - INTERVAL '30 days'")
            .groupBy("EXTRACT(HOUR FROM interaction.createdAt)")
            .addGroupBy("EXTRACT(DOW FROM interaction.createdAt)")
            .orderBy("count", "DESC")
            .getRawMany();
        const hourlyMap = new Map();
        for (const row of result) {
            const hour = Number(row.hour);
            hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + Number(row.count));
        }
        const hourly = Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            interactions: hourlyMap.get(i) || 0,
        })).sort((a, b) => b.interactions - a.interactions);
        const dailyMap = new Map();
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        for (const row of result) {
            const day = Number(row.dayOfWeek);
            dailyMap.set(day, (dailyMap.get(day) || 0) + Number(row.count));
        }
        const daily = Array.from({ length: 7 }, (_, i) => ({
            day: dayNames[i],
            interactions: dailyMap.get(i) || 0,
        })).sort((a, b) => b.interactions - a.interactions);
        return {
            bestHours: hourly.slice(0, 5),
            bestDays: daily.slice(0, 3),
            hourlyBreakdown: hourly.sort((a, b) => a.hour - b.hour),
            dailyBreakdown: daily,
        };
    }
    async getEngagementAnalytics(userId, days = 30) {
        let daysNum = Number(days) || 30;
        const recentCount = await this.contentRepository
            .createQueryBuilder("content")
            .select("COUNT(*)", "count")
            .where("content.userId = :userId", { userId })
            .andWhere("content.isActive = :isActive", { isActive: true })
            .andWhere("content.sortOrder = :sortOrder", { sortOrder: 0 })
            .andWhere(`content.createdAt > NOW() - INTERVAL '${daysNum} days'`)
            .getRawOne();
        if (Number(recentCount?.count || 0) === 0) {
            const oldest = await this.contentRepository
                .createQueryBuilder("content")
                .select("MIN(content.createdAt)", "oldest")
                .where("content.userId = :userId", { userId })
                .andWhere("content.isActive = :isActive", { isActive: true })
                .andWhere("content.sortOrder = :sortOrder", { sortOrder: 0 })
                .getRawOne();
            if (oldest?.oldest) {
                const oldestDate = new Date(oldest.oldest);
                const diffDays = Math.ceil((Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                daysNum = Math.max(daysNum, diffDays);
            }
        }
        const dailyStats = await this.contentRepository
            .createQueryBuilder("content")
            .select("DATE(content.createdAt)", "date")
            .addSelect("COUNT(DISTINCT content.postId)", "posts")
            .addSelect("SUM(content.viewCount)", "views")
            .addSelect("SUM(content.likeCount)", "likes")
            .addSelect("SUM(content.commentCount)", "comments")
            .addSelect("SUM(content.shareCount)", "shares")
            .addSelect("AVG(content.engagementScore)", "avgScore")
            .where("content.userId = :userId", { userId })
            .andWhere("content.isActive = :isActive", { isActive: true })
            .andWhere("content.sortOrder = :sortOrder", { sortOrder: 0 })
            .andWhere(`content.createdAt > NOW() - INTERVAL '${daysNum} days'`)
            .groupBy("DATE(content.createdAt)")
            .orderBy("date", "ASC")
            .getRawMany();
        const totals = await this.contentRepository
            .createQueryBuilder("content")
            .select("COUNT(DISTINCT content.postId)", "totalPosts")
            .addSelect("SUM(content.viewCount)", "totalViews")
            .addSelect("SUM(content.likeCount)", "totalLikes")
            .addSelect("SUM(content.commentCount)", "totalComments")
            .addSelect("SUM(content.shareCount)", "totalShares")
            .where("content.userId = :userId", { userId })
            .andWhere("content.isActive = :isActive", { isActive: true })
            .andWhere("content.sortOrder = :sortOrder", { sortOrder: 0 })
            .andWhere(`content.createdAt > NOW() - INTERVAL '${daysNum} days'`)
            .getRawOne();
        const totalLikes = Number(totals.totalLikes || 0);
        const totalComments = Number(totals.totalComments || 0);
        const totalShares = Number(totals.totalShares || 0);
        const totalEngagement = totalLikes + totalComments + totalShares;
        const totalViews = Number(totals.totalViews || 0);
        const totalPosts = Number(totals.totalPosts || 0);
        const denominator = totalViews > 0 ? totalViews : totalPosts;
        const engagementRate = denominator > 0 ? (totalEngagement / denominator) * 100 : 0;
        return {
            daily: dailyStats.map((row) => ({
                date: row.date,
                posts: Number(row.posts),
                views: Number(row.views || 0),
                likes: Number(row.likes || 0),
                comments: Number(row.comments || 0),
                shares: Number(row.shares || 0),
                avgScore: Number(row.avgScore || 0),
            })),
            totals: {
                posts: totalPosts,
                views: totalViews,
                likes: totalLikes,
                comments: totalComments,
                shares: totalShares,
                engagementRate: Math.round(engagementRate * 100) / 100,
            },
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(content_entity_1.Content)),
    __param(1, (0, typeorm_1.InjectRepository)(content_interaction_entity_1.ContentInteraction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map