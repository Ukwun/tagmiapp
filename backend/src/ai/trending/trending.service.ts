import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Cron, CronExpression } from "@nestjs/schedule"
import { Content } from "../../content/entities/content.entity"
import { HashtagStat } from "./hashtag-stat.entity"

@Injectable()
export class TrendingService {
  private readonly logger = new Logger(TrendingService.name)

  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(HashtagStat)
    private readonly hashtagStatRepository: Repository<HashtagStat>,
  ) {}

  /**
   * Recalculate hashtag trending stats every 30 minutes.
   * Counts hashtag usage in recent time windows and computes trend scores.
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async recalculateTrendingHashtags() {
    this.logger.log("Recalculating trending hashtags...")

    try {
      // Get all hashtags from recent posts (last 7 days)
      const recentPosts = await this.contentRepository
        .createQueryBuilder("content")
        .select("content.hashtags")
        .where("content.isActive = :isActive", { isActive: true })
        .andWhere("content.hashtags IS NOT NULL")
        .andWhere("content.createdAt > NOW() - INTERVAL '7 days'")
        .getMany()

      // Count hashtag usage across time windows
      const hashtagCounts = new Map<string, { total: number; recent1h: number; recent6h: number; recent24h: number }>()

      const now = Date.now()
      const oneHour = 60 * 60 * 1000
      const sixHours = 6 * oneHour
      const twentyFourHours = 24 * oneHour

      for (const post of recentPosts) {
        if (!post.hashtags || !Array.isArray(post.hashtags)) continue
        const postAge = now - new Date(post.createdAt).getTime()

        for (const tag of post.hashtags) {
          const normalized = tag.toLowerCase().replace(/^#/, "")
          if (!normalized) continue

          if (!hashtagCounts.has(normalized)) {
            hashtagCounts.set(normalized, { total: 0, recent1h: 0, recent6h: 0, recent24h: 0 })
          }

          const counts = hashtagCounts.get(normalized)
          counts.total++
          if (postAge <= oneHour) counts.recent1h++
          if (postAge <= sixHours) counts.recent6h++
          if (postAge <= twentyFourHours) counts.recent24h++
        }
      }

      // Calculate trend scores and upsert
      for (const [hashtag, counts] of hashtagCounts) {
        // Trend score: recent velocity relative to baseline, weighted by total volume
        const baseline = Math.max(counts.total / 7, 1) // avg daily usage
        const recentVelocity = counts.recent1h * 24 // projected daily rate from last hour
        const trendScore = (recentVelocity / baseline) * Math.log2(counts.total + 1)

        await this.hashtagStatRepository.upsert(
          {
            hashtag,
            postCount: counts.total,
            recentPostCount1h: counts.recent1h,
            recentPostCount6h: counts.recent6h,
            recentPostCount24h: counts.recent24h,
            trendScore,
            updatedAt: new Date(),
          },
          ["hashtag"],
        )
      }

      this.logger.log(`Trending hashtags updated: ${hashtagCounts.size} hashtags`)
    } catch (error) {
      this.logger.error("Failed to recalculate trending hashtags", (error as any).stack)
    }
  }

  /**
   * Get trending hashtags sorted by trend score.
   */
  async getTrendingHashtags(limit = 20) {
    const limitNum = Number(limit) || 20

    return this.hashtagStatRepository.find({
      where: {},
      order: { trendScore: "DESC" },
      take: limitNum,
    })
  }

  /**
   * Get hashtag stats for a specific hashtag.
   */
  async getHashtagStats(hashtag: string) {
    const normalized = hashtag.toLowerCase().replace(/^#/, "")
    return this.hashtagStatRepository.findOne({ where: { hashtag: normalized } })
  }
}

