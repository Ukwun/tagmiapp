import { Injectable } from "@nestjs/common"
import { MoreThanOrEqual } from "typeorm"
import { ReportStatus } from "../../reports/entities/report.entity"
import { RedisService } from "../../config/redis.service"
import { UserRepository } from "../../users/repositories/user.repository"
import { ContentRepository } from "../../content/repositories/content.repository"
import { ContentInteractionRepository } from "../../content/repositories/content-interaction.repository"
import { EngagementSignalRepository } from "../../content/repositories/engagement-signal.repository"
import { ReportRepository } from "../../reports/repositories/report.repository"
import { BookingRepository } from "../../bookings/repositories/booking.repository"
import { ReferralRepository } from "../../referrals/repositories/referral.repository"
import { UserPreferenceRepository } from "../../content/repositories/user-preference.repository"

@Injectable()
export class AdminDashboardService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly contentRepo: ContentRepository,
    private readonly interactionRepo: ContentInteractionRepository,
    private readonly signalRepo: EngagementSignalRepository,
    private readonly reportRepo: ReportRepository,
    private readonly bookingRepo: BookingRepository,
    private readonly referralRepo: ReferralRepository,
    private readonly redisService: RedisService,
    private readonly userPreferenceRepo: UserPreferenceRepository,
  ) {}

  async getDashboardOverview() {
    const cached = await this.redisService.get("admin:dashboard")
    if (cached) return JSON.parse(cached)

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 86400000)
    const monthAgo = new Date(now.getTime() - 30 * 86400000)

    const [
      totalUsers,
      activeTodayCount,
      newUsersThisWeek,
      newUsersThisMonth,
      roleBreakdown,
      totalContent,
      activeContent,
      contentThisWeek,
      typeBreakdown,
      totalInteractions,
      interactionsThisWeek,
      totalSignals,
      avgEngagement,
      referralStats,
      totalBookings,
      pendingBookings,
      completedBookings,
      revenueResult,
      totalReports,
      pendingReports,
      resolvedThisWeek,
    ] = await Promise.all([
      this.userRepo.count(),
      this.userRepo.count({ where: { lastLogin: MoreThanOrEqual(todayStart) } }),
      this.userRepo.count({ where: { createdAt: MoreThanOrEqual(weekAgo) } }),
      this.userRepo.count({ where: { createdAt: MoreThanOrEqual(monthAgo) } }),
      this.userRepo
        .createQueryBuilder("u")
        .select("u.role", "role")
        .addSelect("COUNT(*)", "count")
        .groupBy("u.role")
        .getRawMany(),
      this.contentRepo.count({ where: { sortOrder: 0 } }),
      this.contentRepo.count({ where: { isActive: true, sortOrder: 0 } }),
      this.contentRepo.count({ where: { createdAt: MoreThanOrEqual(weekAgo), sortOrder: 0 } }),
      this.contentRepo
        .createQueryBuilder("c")
        .select("c.contentType", "type")
        .addSelect("COUNT(*)", "count")
        .where("c.sortOrder = :so", { so: 0 })
        .groupBy("c.contentType")
        .getRawMany(),
      this.interactionRepo.count(),
      this.interactionRepo.count({ where: { createdAt: MoreThanOrEqual(weekAgo) } }),
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
      this.reportRepo.count({ where: { status: ReportStatus.PENDING } }),
      this.reportRepo.count({
        where: { status: ReportStatus.RESOLVED, createdAt: MoreThanOrEqual(weekAgo) },
      }),
    ])

    const roles: Record<string, number> = { talent: 0, client: 0, manager: 0 }
    for (const r of roleBreakdown) roles[r.role] = Number(r.count)

    const types: Record<string, number> = { text: 0, image: 0, video: 0, audio: 0 }
    for (const t of typeBreakdown) types[t.type] = Number(t.count)

    const refStats: Record<string, number> = {}
    for (const r of referralStats) refStats[r.status] = Number(r.count)

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
    }

    await this.redisService.setex("admin:dashboard", 60, JSON.stringify(result))
    return result
  }

  /**
   * Feed Performance Metrics
   *
   * Analyzes the effectiveness of the personalization system by comparing:
   * - Content categorization coverage (how many posts have AI categories)
   * - User preference adoption (how many users have established preferences)
   * - Engagement metrics for categorized vs uncategorized content
   * - Average watch time and completion rates
   *
   * This provides insights into whether personalization is improving engagement.
   */
  async getFeedPerformanceMetrics() {
    const cached = await this.redisService.get("admin:feed-performance")
    if (cached) return JSON.parse(cached)

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 86400000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000)

    // Content categorization coverage
    const [totalPosts, categorizedPosts, recentCategorized] = await Promise.all([
      this.contentRepo.count({ where: { sortOrder: 0 } }),
      this.contentRepo.count({
        where: { sortOrder: 0 },
      }).then(async (total) => {
        // Count posts with non-null categories
        const result = await this.contentRepo
          .createQueryBuilder("c")
          .where("c.sortOrder = :so", { so: 0 })
          .andWhere("c.categories IS NOT NULL")
          .getCount()
        return result
      }),
      this.contentRepo.count({
        where: { sortOrder: 0, createdAt: MoreThanOrEqual(weekAgo) },
      }).then(async (total) => {
        const result = await this.contentRepo
          .createQueryBuilder("c")
          .where("c.sortOrder = :so AND c.createdAt >= :date", { so: 0, date: weekAgo })
          .andWhere("c.categories IS NOT NULL")
          .getCount()
        return result
      }),
    ])

    // User preference adoption
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
    ])

    // Engagement metrics comparison: categorized vs uncategorized content
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
      .getRawOne()

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
      .getRawOne()

    // Top categories by engagement
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
    `, [thirtyDaysAgo])

    // User preference distribution
    const preferenceDistribution = await this.userPreferenceRepo
      .createQueryBuilder("p")
      .select("p.category", "category")
      .addSelect("COUNT(DISTINCT p.userId)", "userCount")
      .addSelect("AVG(p.affinityScore)", "avgAffinity")
      .addSelect("SUM(p.engagementCount)", "totalEngagements")
      .groupBy("p.category")
      .orderBy("COUNT(DISTINCT p.userId)", "DESC")
      .limit(15)
      .getRawMany()

    const result = {
      contentCategorization: {
        totalPosts,
        categorizedPosts,
        coveragePercentage: totalPosts > 0 ? ((categorizedPosts / totalPosts) * 100).toFixed(1) : 0,
        recentCategorized,
        message:
          categorizedPosts < totalPosts * 0.5
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
        message:
          usersWithPreferences < totalUsers * 0.1
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
          engagementScore:
            uncategorizedMetrics?.avgEngagement > 0
              ? (
                ((categorizedMetrics?.avgEngagement - uncategorizedMetrics?.avgEngagement) /
                  uncategorizedMetrics?.avgEngagement) *
                100
              ).toFixed(1) + "%"
              : "N/A",
          watchTime:
            uncategorizedMetrics?.avgWatchTime > 0
              ? (
                ((categorizedMetrics?.avgWatchTime - uncategorizedMetrics?.avgWatchTime) /
                  uncategorizedMetrics?.avgWatchTime) *
                100
              ).toFixed(1) + "%"
              : "N/A",
        },
      },
      topCategories: topCategories.map((cat: any) => ({
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
      recommendations: this.generateRecommendations(
        categorizedPosts,
        totalPosts,
        usersWithPreferences,
        totalUsers,
        categorizedMetrics,
        uncategorizedMetrics,
      ),
    }

    await this.redisService.setex("admin:feed-performance", 300, JSON.stringify(result))
    return result
  }

  /**
   * Generate actionable recommendations based on feed performance metrics.
   */
  private generateRecommendations(
    categorizedPosts: number,
    totalPosts: number,
    usersWithPreferences: number,
    totalUsers: number,
    categorizedMetrics: any,
    uncategorizedMetrics: any,
  ): string[] {
    const recommendations: string[] = []

    // Categorization recommendations
    const coverageRate = totalPosts > 0 ? categorizedPosts / totalPosts : 0
    if (coverageRate < 0.5) {
      recommendations.push(
        "🚨 CRITICAL: Less than 50% of content is categorized. Run the backfill script immediately: npm run build && node dist/scripts/backfill-content-categories.js",
      )
    } else if (coverageRate < 0.9) {
      recommendations.push("⚙️ Run the backfill script to categorize remaining uncategorized content.")
    }

    // User preference recommendations
    const adoptionRate = totalUsers > 0 ? usersWithPreferences / totalUsers : 0
    if (adoptionRate < 0.1) {
      recommendations.push(
        "📈 Very few users have preferences yet. This is normal for new deployments. Engagement will build preferences over time.",
      )
    } else if (adoptionRate < 0.3) {
      recommendations.push(
        "📊 Growing user preference adoption. Consider promoting engagement features (likes, comments) to accelerate learning.",
      )
    }

    // Performance comparison recommendations
    if (categorizedMetrics?.avgEngagement && uncategorizedMetrics?.avgEngagement) {
      const improvement =
        ((categorizedMetrics.avgEngagement - uncategorizedMetrics.avgEngagement) /
          uncategorizedMetrics.avgEngagement) *
        100

      if (improvement > 10) {
        recommendations.push(
          `✅ Categorized content shows ${improvement.toFixed(1)}% higher engagement! Personalization is working.`,
        )
      } else if (improvement < -10) {
        recommendations.push(
          `⚠️ Categorized content has ${Math.abs(improvement).toFixed(1)}% lower engagement. Review category accuracy and algorithm parameters.`,
        )
      } else {
        recommendations.push(
          "📊 Engagement is similar between categorized and uncategorized content. Personalization impact is neutral so far.",
        )
      }
    }

    // Algorithm tuning recommendations
    if (categorizedMetrics?.avgCompletionRate && categorizedMetrics.avgCompletionRate < 0.3) {
      recommendations.push(
        "⚙️ Low completion rate (<30%). Consider adjusting the 70/30 personalized/discovery split or reviewing content quality.",
      )
    }

    if (recommendations.length === 0) {
      recommendations.push("✅ All metrics look healthy. Continue monitoring for trends.")
    }

    return recommendations
  }
}
