import { Injectable } from "@nestjs/common"
import { ContentRepository } from "../../content/repositories/content.repository"
import { ContentInteractionRepository } from "../../content/repositories/content-interaction.repository"
import { EngagementSignalRepository } from "../../content/repositories/engagement-signal.repository"
import { HashtagStatRepository } from "../../ai/trending/repositories/hashtag-stat.repository"

@Injectable()
export class AdminEngagementService {
  constructor(
    private readonly contentRepo: ContentRepository,
    private readonly interactionRepo: ContentInteractionRepository,
    private readonly signalRepo: EngagementSignalRepository,
    private readonly hashtagStatRepo: HashtagStatRepository,
  ) {}

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
    ])

    const interactions: Record<string, number> = {}
    for (const i of interactionBreakdown) interactions[i.type] = Number(i.count)

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
    }
  }

  async getTopContent(period?: string, limit = 20) {
    const qb = this.contentRepo
      .createQueryBuilder("c")
      .leftJoinAndSelect("c.user", "user")
      .where("c.sortOrder = :so AND c.isActive = :ia", { so: 0, ia: true })

    if (period && period !== "all") {
      const days = period === "7d" ? 7 : period === "30d" ? 30 : 90
      const cutoff = new Date(Date.now() - days * 86400000)
      qb.andWhere("c.createdAt >= :cutoff", { cutoff })
    }

    const data = await qb
      .orderBy("c.engagementScore", "DESC")
      .take(limit)
      .getMany()

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
    }))
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
      .getRawMany()

    return breakdown.map((b) => ({
      type: b.type,
      count: Number(b.count),
      avgEngagement: Number(b.avgEngagement || 0),
      avgViews: Number(b.avgViews || 0),
      avgLikes: Number(b.avgLikes || 0),
    }))
  }

  async getTrendingHashtags(limit = 20) {
    return this.hashtagStatRepo.find({
      order: { trendScore: "DESC" },
      take: limit,
    })
  }
}
