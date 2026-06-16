import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Content } from "../../content/entities/content.entity"
import { ContentInteraction } from "../../content/entities/content-interaction.entity"

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(ContentInteraction)
    private readonly interactionRepository: Repository<ContentInteraction>,
  ) {}

  /**
   * Analyze when a user's followers are most active (based on their interaction times).
   * Returns hour-of-day breakdown with interaction counts.
   */
  async getBestPostingTimes(userId: string) {
    // Get interactions on this user's content, grouped by hour of day
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
      .getRawMany()

    // Aggregate by hour
    const hourlyMap = new Map<number, number>()
    for (const row of result) {
      const hour = Number(row.hour)
      hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + Number(row.count))
    }

    const hourly = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      interactions: hourlyMap.get(i) || 0,
    })).sort((a, b) => b.interactions - a.interactions)

    // Aggregate by day of week
    const dailyMap = new Map<number, number>()
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    for (const row of result) {
      const day = Number(row.dayOfWeek)
      dailyMap.set(day, (dailyMap.get(day) || 0) + Number(row.count))
    }

    const daily = Array.from({ length: 7 }, (_, i) => ({
      day: dayNames[i],
      interactions: dailyMap.get(i) || 0,
    })).sort((a, b) => b.interactions - a.interactions)

    return {
      bestHours: hourly.slice(0, 5),
      bestDays: daily.slice(0, 3),
      hourlyBreakdown: hourly.sort((a, b) => a.hour - b.hour),
      dailyBreakdown: daily,
    }
  }

  /**
   * Get engagement rate analytics for a user over time.
   */
  async getEngagementAnalytics(userId: string, days = 30) {
    let daysNum = Number(days) || 30

    // Auto-expand: if the user has no posts in the requested window,
    // fall back to covering all their posts
    const recentCount = await this.contentRepository
      .createQueryBuilder("content")
      .select("COUNT(*)", "count")
      .where("content.userId = :userId", { userId })
      .andWhere("content.isActive = :isActive", { isActive: true })
      .andWhere("content.sortOrder = :sortOrder", { sortOrder: 0 })
      .andWhere(`content.createdAt > NOW() - INTERVAL '${daysNum} days'`)
      .getRawOne()

    if (Number(recentCount?.count || 0) === 0) {
      // Find how far back the oldest post goes
      const oldest = await this.contentRepository
        .createQueryBuilder("content")
        .select("MIN(content.createdAt)", "oldest")
        .where("content.userId = :userId", { userId })
        .andWhere("content.isActive = :isActive", { isActive: true })
        .andWhere("content.sortOrder = :sortOrder", { sortOrder: 0 })
        .getRawOne()

      if (oldest?.oldest) {
        const oldestDate = new Date(oldest.oldest)
        const diffDays = Math.ceil((Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
        daysNum = Math.max(daysNum, diffDays)
      }
    }

    // Get daily engagement metrics
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
      .getRawMany()

    // Totals — scoped to the same date range as daily
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
      .getRawOne()

    const totalLikes = Number(totals.totalLikes || 0)
    const totalComments = Number(totals.totalComments || 0)
    const totalShares = Number(totals.totalShares || 0)
    const totalEngagement = totalLikes + totalComments + totalShares
    const totalViews = Number(totals.totalViews || 0)
    const totalPosts = Number(totals.totalPosts || 0)
    // Use views as denominator if available, otherwise fall back to post count
    const denominator = totalViews > 0 ? totalViews : totalPosts
    const engagementRate = denominator > 0 ? (totalEngagement / denominator) * 100 : 0

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
    }
  }
}
