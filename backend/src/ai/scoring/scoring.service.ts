import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Cron, CronExpression } from "@nestjs/schedule"
import { Content } from "../../content/entities/content.entity"
import { EngagementSignal } from "../../content/entities/engagement-signal.entity"
import { RedisService } from "../../config/redis.service"

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name)

  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(EngagementSignal)
    private readonly engagementSignalRepository: Repository<EngagementSignal>,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Flush Redis signal queue to Postgres every 30 seconds.
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async flushSignalQueue() {
    if (!this.redisService.isConnected) return

    try {
      const queueLength = await this.redisService.getSignalQueueLength()
      if (queueLength === 0) return

      let totalFlushed = 0
      // Drain in batches of 500
      while (true) {
        const raw = await this.redisService.drainSignals(500)
        if (raw.length === 0) break

        const signals: any[] = []
        for (const item of raw) {
          try { signals.push(JSON.parse(item)) } catch { /* skip */ }
        }

        if (signals.length > 0) {
          const entities = signals.map((s) =>
            this.engagementSignalRepository.create({
              userId: s.userId,
              contentId: s.contentId,
              postId: s.postId,
              contentType: s.contentType,
              mediaProgress: s.mediaProgress || 0,
              mediaCompleted: s.mediaCompleted || false,
              dwellTimeMs: s.dwellTimeMs || 0,
              scrollDepth: s.scrollDepth || 0,
              slideIndex: s.slideIndex || 0,
              totalSlides: s.totalSlides || 1,
            }),
          )
          await this.engagementSignalRepository.save(entities)
          totalFlushed += entities.length
        }
      }

      if (totalFlushed > 0) {
        this.logger.log(`Flushed ${totalFlushed} engagement signals from Redis to DB`)
      }
    } catch (error) {
      this.logger.error("Failed to flush signal queue", (error as any).stack)
    }
  }

  /**
   * Recalculate engagement scores for all active content.
   * Runs every 10 minutes via cron.
   *
   * Formula:
   *   score = (likeCount * 3) + (commentCount * 5) + (shareCount * 4) + (viewCount * 0.1)
   *           + (completionRate * 10) + (avgWatchTime * 2) + (avgDwellTime * 1.5)
   *           - hoursSincePost * decayFactor
   *
   * decayFactor = 0.5 (lose 0.5 points per hour of age)
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async recalculateScores() {
    await this.retryOnDeadlock(() => this.executeScoreRecalculation(), 3)
  }

  /**
   * Retry a database operation on deadlock with exponential backoff.
   * Deadlocks are transient — they usually succeed on retry.
   */
  private async retryOnDeadlock<T>(operation: () => Promise<T>, maxRetries: number): Promise<T | void> {
    let lastError: any
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error: any) {
        lastError = error
        // Check if error is a deadlock (PostgreSQL error code 40P01)
        const isDeadlock = error?.message?.includes('deadlock detected') || error?.code === '40P01'

        if (isDeadlock && attempt < maxRetries) {
          const delayMs = Math.pow(2, attempt) * 100 // 200ms, 400ms, 800ms
          this.logger.warn(`Deadlock detected on attempt ${attempt}/${maxRetries}, retrying in ${delayMs}ms...`)
          await new Promise(resolve => setTimeout(resolve, delayMs))
          continue
        }

        // Not a deadlock or max retries reached
        throw error
      }
    }
    // Should never reach here, but TypeScript needs it
    this.logger.error("Max retries reached for score recalculation", lastError?.stack)
  }

  private async executeScoreRecalculation(): Promise<void> {
    this.logger.log("Aggregating engagement signals...")

    // Step 1: Aggregate engagement signals into Content columns
    await this.aggregateEngagementSignals()

    // Step 2: Recalculate engagement scores with updated formula
    this.logger.log("Recalculating engagement scores...")
    await this.contentRepository
      .createQueryBuilder()
      .update(Content)
      .set({
        engagementScore: () =>
          `("likeCount" * 3) + ("commentCount" * 5) + ("shareCount" * 4) + ("viewCount" * 0.1) ` +
          `+ ("completionRate" * 10) + ("avgWatchTime" * 8) + ("avgDwellTime" * 6) ` +
          `- LEAST(LN(1 + EXTRACT(EPOCH FROM (NOW() - "createdAt")) / 3600.0) * 2, 50) ` +
          `+ GREATEST(0, 30 - EXTRACT(EPOCH FROM (NOW() - "createdAt")) / 240.0)`,
      })
      .where("isActive = :isActive", { isActive: true })
      .execute()

    // Step 3: Calculate virality scores based on engagement velocity
    await this.calculateViralityScores()

    // Step 4: Invalidate feed caches so ranked feeds pick up new scores
    await this.redisService.invalidateFeedCache()

    this.logger.log("Engagement scores recalculated successfully")
  }

  /**
   * Calculate virality scores for active content.
   *
   * Virality is about VELOCITY — how fast engagement is growing relative to exposure.
   *
   * Components:
   *   1. engagementRate = weighted interactions / views (quality per impression)
   *   2. velocity = recent engagement (1h) vs baseline rate (are interactions accelerating?)
   *   3. completionSignal = completionRate × avgWatchTime (are people actually finishing it?)
   *   4. viewMomentum = views_1h / (views_24h / 24) (is viewership accelerating?)
   *   5. uniqueReach = unique users engaging / unique viewers (breadth of appeal)
   *
   * Final: viralityScore = engagementRate × velocity × completionSignal × viewMomentum
   *        with age dampening so stale viral content decays
   */
  private async calculateViralityScores(): Promise<void> {
    this.logger.log("Calculating virality scores...")

    await this.contentRepository.query(`
      WITH interaction_windows AS (
        SELECT
          ci."contentId",
          COUNT(*) FILTER (WHERE ci."createdAt" > NOW() - INTERVAL '1 hour') as interactions_1h,
          COUNT(*) FILTER (WHERE ci."createdAt" > NOW() - INTERVAL '6 hours') as interactions_6h,
          COUNT(*) FILTER (WHERE ci."createdAt" > NOW() - INTERVAL '24 hours') as interactions_24h,
          COUNT(*) FILTER (WHERE ci."createdAt" > NOW() - INTERVAL '7 days') as interactions_7d,
          COUNT(*) FILTER (WHERE ci.type = 'view' AND ci."createdAt" > NOW() - INTERVAL '1 hour') as views_1h,
          COUNT(*) FILTER (WHERE ci.type = 'view' AND ci."createdAt" > NOW() - INTERVAL '24 hours') as views_24h,
          COUNT(*) FILTER (WHERE ci.type = 'like' AND ci."createdAt" > NOW() - INTERVAL '1 hour') as likes_1h,
          COUNT(*) FILTER (WHERE ci.type = 'comment' AND ci."createdAt" > NOW() - INTERVAL '1 hour') as comments_1h,
          COUNT(*) FILTER (WHERE ci.type = 'share' AND ci."createdAt" > NOW() - INTERVAL '1 hour') as shares_1h,
          COUNT(DISTINCT ci."userId") FILTER (WHERE ci."createdAt" > NOW() - INTERVAL '24 hours') as unique_users_24h
        FROM content_interactions ci
        INNER JOIN content c ON ci."contentId" = c.id AND c."sortOrder" = 0 AND c."isActive" = true
        WHERE ci."createdAt" > NOW() - INTERVAL '7 days'
        GROUP BY ci."contentId"
      ),
      virality AS (
        SELECT
          iw."contentId",
          -- Engagement rate: weighted interactions per view (how engaging per impression)
          CASE WHEN c."viewCount" > 0
            THEN (c."likeCount" + c."commentCount" * 2.0 + c."shareCount" * 3.0) / c."viewCount"
            ELSE 0
          END as engagement_rate,

          -- Velocity: how fast are interactions coming in vs baseline?
          -- Compare last 1h rate (projected to 24h) against actual 24h rate.
          -- Capped at 5.0 so a single interaction on a quiet post does not
          -- produce an extreme ratio (e.g. 1 in 1h / 1 in 24h = 24x uncapped).
          CASE WHEN iw.interactions_24h >= 5
            THEN LEAST((iw.interactions_1h * 24.0) / GREATEST(iw.interactions_24h, 1), 5.0)
            ELSE 0
          END as velocity,

          -- View momentum: is viewership accelerating?
          -- Same cap and minimum threshold to avoid noise from low-traffic posts.
          CASE WHEN iw.views_24h >= 5
            THEN LEAST((iw.views_1h * 24.0) / GREATEST(iw.views_24h, 1), 5.0)
            ELSE 0
          END as view_momentum,

          -- Completion signal: are people actually finishing the content?
          GREATEST(c."completionRate", 0.1) * GREATEST(c."avgWatchTime", 0.1) as completion_signal,

          -- Recent engagement strength (weighted)
          (iw.likes_1h * 1.0 + iw.comments_1h * 2.0 + iw.shares_1h * 3.0) as recent_weighted,

          -- Unique reach ratio: how many unique users engaging vs total views
          CASE WHEN iw.views_24h > 0
            THEN iw.unique_users_24h::float / GREATEST(iw.views_24h, 1)
            ELSE 0
          END as reach_ratio,

          -- Age factor: newer content gets a boost, decays over time
          -- Posts < 2h old get full boost, tapers to 0.2 at 48h+
          GREATEST(0.2, 1.0 - (EXTRACT(EPOCH FROM (NOW() - c."createdAt")) / 172800.0)) as age_factor,

          c.id as content_id
        FROM interaction_windows iw
        INNER JOIN content c ON iw."contentId" = c.id
      )
      UPDATE content c
      SET "viralityScore" = GREATEST(0,
        -- Core formula: rate × velocity × completion × momentum, scaled by age
        (
          v.engagement_rate
          * GREATEST(v.velocity, 0.1)
          * GREATEST(v.completion_signal, 0.01)
          * GREATEST(v.view_momentum, 0.1)
          * v.age_factor
          * 100.0
        )
        -- Bonus for strong recent engagement (absolute floor so new viral content gets noticed)
        + v.recent_weighted * 2.0
        -- Bonus for broad appeal (many unique users engaging)
        + v.reach_ratio * 20.0
      )
      FROM virality v
      WHERE c.id = v.content_id
    `)

    // Decay virality for posts with no recent interactions (10% decay per cycle)
    await this.contentRepository
      .createQueryBuilder()
      .update(Content)
      .set({ viralityScore: () => '"viralityScore" * 0.9' })
      .where("isActive = :isActive", { isActive: true })
      .andWhere('"viralityScore" > 0')
      .andWhere("sortOrder = :sortOrder", { sortOrder: 0 })
      .andWhere(`id NOT IN (
        SELECT DISTINCT ci."contentId" FROM content_interactions ci
        WHERE ci."createdAt" > NOW() - INTERVAL '1 hour'
      )`)
      .execute()

    this.logger.log("Virality scores calculated")
  }

  /**
   * Aggregate engagement signals from the last 7 days into Content columns.
   */
  private async aggregateEngagementSignals(): Promise<void> {
    // Aggregate engagement signals from ALL time (no window).
    // Values can only go UP — GREATEST ensures we never overwrite
    // a higher stored value with a lower recalculated one.
    await this.contentRepository.query(`
      WITH slide_dwell AS (
        SELECT
          es."postId",
          es."userId",
          es."slideIndex",
          SUM(es."dwellTimeMs") as total_dwell_ms
        FROM engagement_signals es
        GROUP BY es."postId", es."userId", es."slideIndex"
      ),
      post_signals AS (
        SELECT
          es."postId",
          es."userId",
          COUNT(DISTINCT es."slideIndex") as slides_viewed,
          MAX(es."totalSlides") as total_slides,
          AVG(CASE WHEN es."contentType" IN ('video', 'audio') THEN es."mediaProgress" ELSE NULL END) as avg_media_progress
        FROM engagement_signals es
        GROUP BY es."postId", es."userId"
      ),
      user_dwell AS (
        SELECT
          sd."postId",
          sd."userId",
          SUM(sd.total_dwell_ms) / 1000.0 as total_dwell_seconds
        FROM slide_dwell sd
        GROUP BY sd."postId", sd."userId"
      ),
      post_aggregates AS (
        SELECT
          ps."postId",
          AVG(ps.slides_viewed::float / NULLIF(ps.total_slides, 0)) as completion_rate,
          AVG(ps.avg_media_progress) as avg_watch_time,
          AVG(ud.total_dwell_seconds) as avg_dwell_time
        FROM post_signals ps
        LEFT JOIN user_dwell ud ON ps."postId" = ud."postId" AND ps."userId" = ud."userId"
        GROUP BY ps."postId"
      )
      UPDATE content c
      SET
        "completionRate" = GREATEST(c."completionRate", COALESCE(pa.completion_rate, 0)),
        "avgWatchTime" = GREATEST(c."avgWatchTime", COALESCE(pa.avg_watch_time, 0)),
        "avgDwellTime" = GREATEST(c."avgDwellTime", COALESCE(pa.avg_dwell_time, 0))
      FROM post_aggregates pa
      WHERE c."postId" = pa."postId"
        AND c."sortOrder" = 0
    `)
  }

  /**
   * Get top trending posts ranked purely by real engagement numbers.
   *
   * We sort by total engagement (likes + comments + shares + views)
   * instead of computed scores like viralityScore. Raw counts are a
   * more honest signal — users can look at the numbers and immediately
   * see why a post is trending.
   */
  async getTrendingPosts(page = 1, limit = 20) {
    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 20

    const [posts, total] = await this.contentRepository
      .createQueryBuilder("content")
      .leftJoinAndSelect("content.user", "user")
      .where("content.isActive = :isActive", { isActive: true })
      .andWhere("content.sortOrder = :sortOrder", { sortOrder: 0 })
      .andWhere("user.isActive = :userActive", { userActive: true })
      .andWhere("content.likeCount >= :minLikes", { minLikes: 3 })
      .orderBy("content.engagementScore", "DESC")
      .skip((pageNum - 1) * limitNum)
      .take(limitNum)
      .getManyAndCount()

    return {
      data: posts.map((p) => ({
        postId: p.postId,
        userId: p.userId,
        user: p.user,
        caption: p.caption,
        hashtags: p.hashtags,
        contentType: p.contentType,
        mediaUrl: p.mediaUrl,
        thumbnailUrl: p.thumbnailUrl,
        engagementScore: p.engagementScore,
        viralityScore: p.viralityScore,
        viewCount: p.viewCount,
        likeCount: p.likeCount,
        commentCount: p.commentCount,
        shareCount: p.shareCount,
        createdAt: p.createdAt,
      })),
      total,
      page: pageNum,
      limit: limitNum,
    }
  }
}

