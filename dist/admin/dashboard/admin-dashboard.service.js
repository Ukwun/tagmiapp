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
exports.AdminDashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const report_entity_1 = require("../../reports/entities/report.entity");
const redis_service_1 = require("../../config/redis.service");
const user_repository_1 = require("../../users/repositories/user.repository");
const content_repository_1 = require("../../content/repositories/content.repository");
const content_interaction_repository_1 = require("../../content/repositories/content-interaction.repository");
const engagement_signal_repository_1 = require("../../content/repositories/engagement-signal.repository");
const report_repository_1 = require("../../reports/repositories/report.repository");
const booking_repository_1 = require("../../bookings/repositories/booking.repository");
const referral_repository_1 = require("../../referrals/repositories/referral.repository");
const user_preference_repository_1 = require("../../content/repositories/user-preference.repository");
let AdminDashboardService = class AdminDashboardService {
    constructor(userRepo, contentRepo, interactionRepo, signalRepo, reportRepo, bookingRepo, referralRepo, redisService, userPreferenceRepo) {
        this.userRepo = userRepo;
        this.contentRepo = contentRepo;
        this.interactionRepo = interactionRepo;
        this.signalRepo = signalRepo;
        this.reportRepo = reportRepo;
        this.bookingRepo = bookingRepo;
        this.referralRepo = referralRepo;
        this.redisService = redisService;
        this.userPreferenceRepo = userPreferenceRepo;
    }
    async getDashboardOverview() {
        const cached = await this.redisService.get("admin:dashboard");
        if (cached)
            return JSON.parse(cached);
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(now.getTime() - 7 * 86400000);
        const monthAgo = new Date(now.getTime() - 30 * 86400000);
        const [totalUsers, activeTodayCount, newUsersThisWeek, newUsersThisMonth, roleBreakdown, totalContent, activeContent, contentThisWeek, typeBreakdown, totalInteractions, interactionsThisWeek, totalSignals, avgEngagement, referralStats, totalBookings, pendingBookings, completedBookings, revenueResult, totalReports, pendingReports, resolvedThisWeek,] = await Promise.all([
            this.userRepo.count(),
            this.userRepo.count({ where: { lastLogin: (0, typeorm_1.MoreThanOrEqual)(todayStart) } }),
            this.userRepo.count({ where: { createdAt: (0, typeorm_1.MoreThanOrEqual)(weekAgo) } }),
            this.userRepo.count({ where: { createdAt: (0, typeorm_1.MoreThanOrEqual)(monthAgo) } }),
            this.userRepo
                .createQueryBuilder("u")
                .select("u.role", "role")
                .addSelect("COUNT(*)", "count")
                .groupBy("u.role")
                .getRawMany(),
            this.contentRepo.count({ where: { sortOrder: 0 } }),
            this.contentRepo.count({ where: { isActive: true, sortOrder: 0 } }),
            this.contentRepo.count({ where: { createdAt: (0, typeorm_1.MoreThanOrEqual)(weekAgo), sortOrder: 0 } }),
            this.contentRepo
                .createQueryBuilder("c")
                .select("c.contentType", "type")
                .addSelect("COUNT(*)", "count")
                .where("c.sortOrder = :so", { so: 0 })
                .groupBy("c.contentType")
                .getRawMany(),
            this.interactionRepo.count(),
            this.interactionRepo.count({ where: { createdAt: (0, typeorm_1.MoreThanOrEqual)(weekAgo) } }),
            this.signalRepo.count(),
            this.contentRepo
                .createQueryBuilder("c")
                .select("AVG(c.engagementScore)", "avg")
                .where("c.sortOrder = :so AND c.isActive = :ia", { so: 0, ia: true })
                .getRawOne(),
            this.referralRepo
                .createQueryBuilder("r")
                .select("r.status", "status")
                .addSelect("COUNT(*)", "count")
                .groupBy("r.status")
                .getRawMany(),
            this.bookingRepo.count(),
            this.bookingRepo.count({ where: { status: "pending" } }),
            this.bookingRepo.count({ where: { status: "completed" } }),
            this.bookingRepo
                .createQueryBuilder("b")
                .select("COALESCE(SUM(b.finalAmount), 0)", "sum")
                .where("b.status IN (:...statuses)", { statuses: ["completed", "paid"] })
                .getRawOne(),
            this.reportRepo.count(),
            this.reportRepo.count({ where: { status: report_entity_1.ReportStatus.PENDING } }),
            this.reportRepo.count({
                where: { status: report_entity_1.ReportStatus.RESOLVED, createdAt: (0, typeorm_1.MoreThanOrEqual)(weekAgo) },
            }),
        ]);
        const roles = { talent: 0, client: 0, manager: 0 };
        for (const r of roleBreakdown)
            roles[r.role] = Number(r.count);
        const types = { text: 0, image: 0, video: 0, audio: 0 };
        for (const t of typeBreakdown)
            types[t.type] = Number(t.count);
        const refStats = {};
        for (const r of referralStats)
            refStats[r.status] = Number(r.count);
        const result = {
            users: {
                total: totalUsers,
                activeToday: activeTodayCount,
                newThisWeek: newUsersThisWeek,
                newThisMonth: newUsersThisMonth,
                byRole: roles,
            },
            content: {
                total: totalContent,
                active: activeContent,
                newThisWeek: contentThisWeek,
                byType: types,
            },
            engagement: {
                totalInteractions,
                interactionsThisWeek,
                totalSignals,
                avgEngagementScore: Number(avgEngagement?.avg || 0),
            },
            referrals: {
                total: Object.values(refStats).reduce((a, b) => a + b, 0),
                credited: refStats["credited"] || 0,
                rejected: refStats["rejected"] || 0,
                pendingValidation: (refStats["validating"] || 0) + (refStats["registered"] || 0),
            },
            bookings: {
                total: totalBookings,
                pending: pendingBookings,
                completed: completedBookings,
                totalRevenue: Number(revenueResult?.sum || 0),
            },
            reports: {
                total: totalReports,
                pending: pendingReports,
                resolvedThisWeek,
            },
        };
        await this.redisService.setex("admin:dashboard", 60, JSON.stringify(result));
        return result;
    }
    async getFeedPerformanceMetrics() {
        const cached = await this.redisService.get("admin:feed-performance");
        if (cached)
            return JSON.parse(cached);
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 86400000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
        const [totalPosts, categorizedPosts, recentCategorized] = await Promise.all([
            this.contentRepo.count({ where: { sortOrder: 0 } }),
            this.contentRepo.count({
                where: { sortOrder: 0 },
            }).then(async (total) => {
                const result = await this.contentRepo
                    .createQueryBuilder("c")
                    .where("c.sortOrder = :so", { so: 0 })
                    .andWhere("c.categories IS NOT NULL")
                    .getCount();
                return result;
            }),
            this.contentRepo.count({
                where: { sortOrder: 0, createdAt: (0, typeorm_1.MoreThanOrEqual)(weekAgo) },
            }).then(async (total) => {
                const result = await this.contentRepo
                    .createQueryBuilder("c")
                    .where("c.sortOrder = :so AND c.createdAt >= :date", { so: 0, date: weekAgo })
                    .andWhere("c.categories IS NOT NULL")
                    .getCount();
                return result;
            }),
        ]);
        const [totalUsers, usersWithPreferences, activePreferences] = await Promise.all([
            this.userRepo.count(),
            this.userPreferenceRepo
                .createQueryBuilder("p")
                .select("COUNT(DISTINCT p.userId)", "count")
                .getRawOne()
                .then((r) => Number(r.count)),
            this.userPreferenceRepo
                .createQueryBuilder("p")
                .select("COUNT(DISTINCT p.userId)", "count")
                .where("p.lastEngagementAt >= :date", { date: weekAgo })
                .getRawOne()
                .then((r) => Number(r.count)),
        ]);
        const categorizedMetrics = await this.contentRepo
            .createQueryBuilder("c")
            .select("AVG(c.engagementScore)", "avgEngagement")
            .addSelect("AVG(c.avgWatchTime)", "avgWatchTime")
            .addSelect("AVG(c.completionRate)", "avgCompletionRate")
            .addSelect("AVG(c.likeCount::float / NULLIF(c.viewCount, 0))", "engagementRate")
            .where("c.sortOrder = :so AND c.categories IS NOT NULL AND c.createdAt >= :date", {
            so: 0,
            date: thirtyDaysAgo,
        })
            .getRawOne();
        const uncategorizedMetrics = await this.contentRepo
            .createQueryBuilder("c")
            .select("AVG(c.engagementScore)", "avgEngagement")
            .addSelect("AVG(c.avgWatchTime)", "avgWatchTime")
            .addSelect("AVG(c.completionRate)", "avgCompletionRate")
            .addSelect("AVG(c.likeCount::float / NULLIF(c.viewCount, 0))", "engagementRate")
            .where("c.sortOrder = :so AND c.categories IS NULL AND c.createdAt >= :date", {
            so: 0,
            date: thirtyDaysAgo,
        })
            .getRawOne();
        const topCategories = await this.contentRepo.query(`
      SELECT
        cat.category,
        COUNT(DISTINCT c.id) as post_count,
        AVG(c."engagementScore") as avg_engagement,
        AVG(c."avgWatchTime") as avg_watch_time,
        SUM(c."viewCount") as total_views
      FROM content c,
        jsonb_to_recordset(c.categories) as cat(category text, confidence numeric)
      WHERE c."sortOrder" = 0
        AND c."createdAt" >= $1
        AND cat.confidence >= 0.6
      GROUP BY cat.category
      ORDER BY avg_engagement DESC
      LIMIT 10
    `, [thirtyDaysAgo]);
        const preferenceDistribution = await this.userPreferenceRepo
            .createQueryBuilder("p")
            .select("p.category", "category")
            .addSelect("COUNT(DISTINCT p.userId)", "userCount")
            .addSelect("AVG(p.affinityScore)", "avgAffinity")
            .addSelect("SUM(p.engagementCount)", "totalEngagements")
            .groupBy("p.category")
            .orderBy("COUNT(DISTINCT p.userId)", "DESC")
            .limit(15)
            .getRawMany();
        const result = {
            contentCategorization: {
                totalPosts,
                categorizedPosts,
                coveragePercentage: totalPosts > 0 ? ((categorizedPosts / totalPosts) * 100).toFixed(1) : 0,
                recentCategorized,
                message: categorizedPosts < totalPosts * 0.5
                    ? "⚠️ Less than 50% of content is categorized. Run the backfill script."
                    : categorizedPosts < totalPosts * 0.9
                        ? "⚙️ Categorization in progress. Most content is categorized."
                        : "✅ Excellent! Most content is categorized.",
            },
            userPreferences: {
                totalUsers,
                usersWithPreferences,
                adoptionRate: totalUsers > 0 ? ((usersWithPreferences / totalUsers) * 100).toFixed(1) : 0,
                activeThisWeek: activePreferences,
                message: usersWithPreferences < totalUsers * 0.1
                    ? "⚠️ Low adoption. Users need to engage with content to build preferences."
                    : usersWithPreferences < totalUsers * 0.5
                        ? "⚙️ Growing adoption. Personalization is learning."
                        : "✅ Great! Majority of users have preferences.",
            },
            engagementComparison: {
                categorized: {
                    avgEngagementScore: Number(categorizedMetrics?.avgEngagement || 0).toFixed(2),
                    avgWatchTime: Number(categorizedMetrics?.avgWatchTime || 0).toFixed(3),
                    avgCompletionRate: Number(categorizedMetrics?.avgCompletionRate || 0).toFixed(3),
                    engagementRate: Number(categorizedMetrics?.engagementRate || 0).toFixed(4),
                },
                uncategorized: {
                    avgEngagementScore: Number(uncategorizedMetrics?.avgEngagement || 0).toFixed(2),
                    avgWatchTime: Number(uncategorizedMetrics?.avgWatchTime || 0).toFixed(3),
                    avgCompletionRate: Number(uncategorizedMetrics?.avgCompletionRate || 0).toFixed(3),
                    engagementRate: Number(uncategorizedMetrics?.engagementRate || 0).toFixed(4),
                },
                improvement: {
                    engagementScore: uncategorizedMetrics?.avgEngagement > 0
                        ? (((categorizedMetrics?.avgEngagement - uncategorizedMetrics?.avgEngagement) /
                            uncategorizedMetrics?.avgEngagement) *
                            100).toFixed(1) + "%"
                        : "N/A",
                    watchTime: uncategorizedMetrics?.avgWatchTime > 0
                        ? (((categorizedMetrics?.avgWatchTime - uncategorizedMetrics?.avgWatchTime) /
                            uncategorizedMetrics?.avgWatchTime) *
                            100).toFixed(1) + "%"
                        : "N/A",
                },
            },
            topCategories: topCategories.map((cat) => ({
                category: cat.category,
                postCount: Number(cat.post_count),
                avgEngagement: Number(cat.avg_engagement).toFixed(2),
                avgWatchTime: Number(cat.avg_watch_time).toFixed(3),
                totalViews: Number(cat.total_views),
            })),
            preferenceDistribution: preferenceDistribution.map((p) => ({
                category: p.category,
                userCount: Number(p.userCount),
                avgAffinity: Number(p.avgAffinity).toFixed(3),
                totalEngagements: Number(p.totalEngagements),
            })),
            recommendations: this.generateRecommendations(categorizedPosts, totalPosts, usersWithPreferences, totalUsers, categorizedMetrics, uncategorizedMetrics),
        };
        await this.redisService.setex("admin:feed-performance", 300, JSON.stringify(result));
        return result;
    }
    generateRecommendations(categorizedPosts, totalPosts, usersWithPreferences, totalUsers, categorizedMetrics, uncategorizedMetrics) {
        const recommendations = [];
        const coverageRate = totalPosts > 0 ? categorizedPosts / totalPosts : 0;
        if (coverageRate < 0.5) {
            recommendations.push("🚨 CRITICAL: Less than 50% of content is categorized. Run the backfill script immediately: npm run build && node dist/scripts/backfill-content-categories.js");
        }
        else if (coverageRate < 0.9) {
            recommendations.push("⚙️ Run the backfill script to categorize remaining uncategorized content.");
        }
        const adoptionRate = totalUsers > 0 ? usersWithPreferences / totalUsers : 0;
        if (adoptionRate < 0.1) {
            recommendations.push("📈 Very few users have preferences yet. This is normal for new deployments. Engagement will build preferences over time.");
        }
        else if (adoptionRate < 0.3) {
            recommendations.push("📊 Growing user preference adoption. Consider promoting engagement features (likes, comments) to accelerate learning.");
        }
        if (categorizedMetrics?.avgEngagement && uncategorizedMetrics?.avgEngagement) {
            const improvement = ((categorizedMetrics.avgEngagement - uncategorizedMetrics.avgEngagement) /
                uncategorizedMetrics.avgEngagement) *
                100;
            if (improvement > 10) {
                recommendations.push(`✅ Categorized content shows ${improvement.toFixed(1)}% higher engagement! Personalization is working.`);
            }
            else if (improvement < -10) {
                recommendations.push(`⚠️ Categorized content has ${Math.abs(improvement).toFixed(1)}% lower engagement. Review category accuracy and algorithm parameters.`);
            }
            else {
                recommendations.push("📊 Engagement is similar between categorized and uncategorized content. Personalization impact is neutral so far.");
            }
        }
        if (categorizedMetrics?.avgCompletionRate && categorizedMetrics.avgCompletionRate < 0.3) {
            recommendations.push("⚙️ Low completion rate (<30%). Consider adjusting the 70/30 personalized/discovery split or reviewing content quality.");
        }
        if (recommendations.length === 0) {
            recommendations.push("✅ All metrics look healthy. Continue monitoring for trends.");
        }
        return recommendations;
    }
};
exports.AdminDashboardService = AdminDashboardService;
exports.AdminDashboardService = AdminDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserRepository,
        content_repository_1.ContentRepository,
        content_interaction_repository_1.ContentInteractionRepository,
        engagement_signal_repository_1.EngagementSignalRepository,
        report_repository_1.ReportRepository,
        booking_repository_1.BookingRepository,
        referral_repository_1.ReferralRepository,
        redis_service_1.RedisService,
        user_preference_repository_1.UserPreferenceRepository])
], AdminDashboardService);
//# sourceMappingURL=admin-dashboard.service.js.map