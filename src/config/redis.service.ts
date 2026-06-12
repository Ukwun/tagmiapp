import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import Redis from "ioredis"

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis
  private readonly logger = new Logger(RedisService.name)

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>("REDIS_URL") || "redis://localhost:6379"
    this.client = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 200, 5000),
      lazyConnect: true,
    })

    this.client.on("error", (err) => {
      this.logger.warn(`Redis connection error: ${err.message}`)
    })

    this.client.on("connect", () => {
      this.logger.log("Redis connected")
    })

    this.client.connect().catch((err) => {
      this.logger.warn(`Redis unavailable, falling back to direct DB: ${err.message}`)
    })
  }

  onModuleDestroy() {
    this.client?.disconnect()
  }

  get isConnected(): boolean {
    return this.client?.status === "ready"
  }

  // --- Signal Buffering ---

  async pushSignals(signals: object[]): Promise<void> {
    if (!this.isConnected) return
    const pipeline = this.client.pipeline()
    for (const signal of signals) {
      pipeline.lpush("engagement:signals", JSON.stringify(signal))
    }
    await pipeline.exec()
  }

  async drainSignals(batchSize = 500): Promise<string[]> {
    if (!this.isConnected) return []
    const pipeline = this.client.pipeline()
    for (let i = 0; i < batchSize; i++) {
      pipeline.rpop("engagement:signals")
    }
    const results = await pipeline.exec()
    return results
      .map(([err, val]) => (err ? null : val as string))
      .filter(Boolean)
  }

  async getSignalQueueLength(): Promise<number> {
    if (!this.isConnected) return 0
    return this.client.llen("engagement:signals")
  }

  // --- Feed Caching ---

  async getCachedFeed(key: string): Promise<any | null> {
    if (!this.isConnected) return null
    const data = await this.client.get(key)
    if (!data) return null
    try {
      return JSON.parse(data)
    } catch {
      return null
    }
  }

  async setCachedFeed(key: string, data: any, ttlSeconds: number): Promise<void> {
    if (!this.isConnected) return
    await this.client.setex(key, ttlSeconds, JSON.stringify(data))
  }

  async invalidateFeedCache(userId?: string): Promise<void> {
    if (!this.isConnected) return
    if (userId) {
      // Per-user invalidation (e.g., on view-count increments) — do not churn the global fresh pool
      const keys = await this.client.keys(`feed:*:${userId}:*`)
      if (keys.length > 0) {
        await this.client.del(...keys)
      }
    } else {
      // Global invalidation (post create/update/delete) — also clear the fresh candidate pool
      // so brand-new posts become eligible for the "newness injection" slot immediately.
      const feedKeys = await this.client.keys("feed:*")
      const freshKeys = await this.client.keys("freshpool:*")
      const allKeys = [...feedKeys, ...freshKeys]
      if (allKeys.length > 0) {
        await this.client.del(...allKeys)
      }
    }
  }

  // --- Scoring Cache ---

  async getCachedScore(postId: string): Promise<{ completionRate: number; avgWatchTime: number; avgDwellTime: number } | null> {
    if (!this.isConnected) return null
    const data = await this.client.get(`scores:${postId}`)
    if (!data) return null
    try {
      return JSON.parse(data)
    } catch {
      return null
    }
  }

  async setCachedScores(scores: Array<{ postId: string; completionRate: number; avgWatchTime: number; avgDwellTime: number }>, ttlSeconds = 600): Promise<void> {
    if (!this.isConnected) return
    const pipeline = this.client.pipeline()
    for (const s of scores) {
      pipeline.setex(`scores:${s.postId}`, ttlSeconds, JSON.stringify(s))
    }
    await pipeline.exec()
  }

  // --- Generic Cache Helpers ---

  async get(key: string): Promise<string | null> {
    if (!this.isConnected) return null
    return this.client.get(key)
  }

  async setex(key: string, ttl: number, value: string): Promise<void> {
    if (!this.isConnected) return
    await this.client.setex(key, ttl, value)
  }

  async del(...keys: string[]): Promise<void> {
    if (!this.isConnected || keys.length === 0) return
    await this.client.del(...keys)
  }
}
