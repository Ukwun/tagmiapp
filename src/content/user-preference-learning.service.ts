/**
 * UserPreferenceLearningService
 *
 * Core learning algorithm for feed personalization.
 * Updates user's category preferences based on engagement signals.
 *
 * Uses exponential moving average to prevent single events from
 * drastically changing preferences:
 *
 *   new_affinity = (alpha * signal) + ((1 - alpha) * old_affinity)
 *
 * Where:
 *   - alpha = 0.15 (learning rate: new events have 15% weight)
 *   - signal = 0.0 to 1.0 (strength of engagement)
 *   - old_affinity = current preference score
 *
 * Engagement signals (weighted):
 *   - Like: 0.3
 *   - Comment: 0.5
 *   - Share: 0.7
 *   - Save: 0.6
 *   - Watch time > 75%: 0.8
 *   - Watch time < 25%: -0.2 (negative signal)
 *   - Skip within 3 seconds: -0.3
 */
import { Injectable } from "@nestjs/common"
import { ContentRepository } from "./repositories/content.repository"
import { UserPreferenceRepository } from "./repositories/user-preference.repository"
import { RedisService } from "../config/redis.service"

// Learning rate: how much weight new events have (0.0 to 1.0)
// Lower = more stable, less reactive to single events
// Higher = faster learning, more volatile
const ALPHA = 0.15

// Minimum confidence threshold for a category to affect preferences
// Categories with confidence < 0.6 are ignored (too uncertain)
const MIN_CONFIDENCE = 0.6

// Engagement signal weights
const ENGAGEMENT_WEIGHTS = {
  like: 0.3,
  comment: 0.5,
  share: 0.7,
  save: 0.6,
  watchHigh: 0.8, // Watch time > 75%
  watchLow: -0.2, // Watch time < 25% (negative signal)
  skip: -0.3, // Skip within 3 seconds (strong negative)
} as const

export interface EngagementSignal {
  type: "like" | "comment" | "share" | "save" | "watch" | "skip"
  metadata?: {
    watchTimePercent?: number // For watch events: 0-100
  }
}

@Injectable()
export class UserPreferenceLearningService {
  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly userPreferenceRepository: UserPreferenceRepository,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Seed user preferences from their signup interests.
   * Called once when user signs up or first requests feed.
   */
  async seedPreferencesFromInterests(userId: string, interests: string[]): Promise<void> {
    await this.userPreferenceRepository.seedFromInterests(userId, interests)
  }

  /**
   * Update user's category preferences based on engagement with content.
   *
   * This is called after:
   * - User likes/comments/shares/saves a post (ContentInteractionService)
   * - User watches a video with tracked completion (EngagementSignalService)
   * - User skips a video very quickly (negative signal)
   *
   * The algorithm:
   * 1. Fetch the content's categories (from AI analysis)
   * 2. Calculate engagement strength (0.0 to 1.0 based on signal type)
   * 3. For each category with confidence > 0.6:
   *    - If first time: create preference with initial score
   *    - If exists: update using exponential moving average
   * 4. Invalidate user's feed cache (so next request shows updated feed)
   */
  async updatePreferencesFromEngagement(
    userId: string,
    contentId: number | string,
    signal: EngagementSignal,
  ): Promise<void> {
    // Fetch the content's categories
    const content = await this.contentRepository.findOne({
      where: { id: String(contentId) },
    })

    if (!content?.categories || !Array.isArray(content.categories) || content.categories.length === 0) {
      // Content not categorized yet, nothing to learn from
      return
    }

    // Calculate engagement strength from signal type
    const engagementStrength = this.calculateEngagementStrength(signal)

    // Update affinity for each category
    for (const cat of content.categories as Array<{ category: string; confidence: number }>) {
      // Only learn from high-confidence categories
      if (cat.confidence < MIN_CONFIDENCE) {
        continue
      }

      const existingPref = await this.userPreferenceRepository.findOne(userId, cat.category)

      if (!existingPref) {
        // First time engaging with this category
        // Create with initial score: 0.5 (neutral) + small boost/penalty
        const initialScore = 0.5 + engagementStrength * 0.2
        const clampedScore = Math.max(0, Math.min(1, initialScore))

        await this.userPreferenceRepository.create({
          userId,
          category: cat.category,
          affinityScore: clampedScore,
          engagementCount: 1,
          lastEngagementAt: new Date(),
        })
      } else {
        // Update using exponential moving average
        const oldAffinity = existingPref.affinityScore
        const newAffinity = ALPHA * engagementStrength + (1 - ALPHA) * oldAffinity
        const clampedScore = Math.max(0, Math.min(1, newAffinity))

        await this.userPreferenceRepository.update(existingPref.id, {
          affinityScore: clampedScore,
          engagementCount: existingPref.engagementCount + 1,
          lastEngagementAt: new Date(),
        })
      }
    }

    // Invalidate user's feed cache so next request uses updated preferences
    await this.invalidateFeedCache(userId)
  }

  /**
   * Get user's top N preferred categories.
   * Used for analytics and debugging.
   */
  async getTopPreferences(userId: string, limit: number = 10) {
    return this.userPreferenceRepository.getTopPreferences(userId, limit)
  }

  /**
   * Calculate engagement strength (0.0 to 1.0) from signal type.
   *
   * Positive signals (like, comment, share, save, long watch) increase affinity.
   * Negative signals (skip, short watch) decrease affinity.
   */
  private calculateEngagementStrength(signal: EngagementSignal): number {
    switch (signal.type) {
      case "like":
        return ENGAGEMENT_WEIGHTS.like

      case "comment":
        return ENGAGEMENT_WEIGHTS.comment

      case "share":
        return ENGAGEMENT_WEIGHTS.share

      case "save":
        return ENGAGEMENT_WEIGHTS.save

      case "watch": {
        // Watch time as percentage (0-100)
        const watchPercent = signal.metadata?.watchTimePercent ?? 0

        if (watchPercent >= 75) {
          return ENGAGEMENT_WEIGHTS.watchHigh // Strong positive signal
        } else if (watchPercent <= 25) {
          return ENGAGEMENT_WEIGHTS.watchLow // Negative signal (user didn't like it)
        } else {
          // Middle range: neutral to slightly positive
          return 0.4
        }
      }

      case "skip":
        return ENGAGEMENT_WEIGHTS.skip // Strong negative signal

      default:
        return 0.5 // Neutral
    }
  }

  /**
   * Invalidate user's feed cache.
   * Called after preferences update so next feed request uses new preferences.
   */
  private async invalidateFeedCache(userId: string): Promise<void> {
    // Delete all feed cache keys for this user
    await this.redisService.invalidateFeedCache(userId)
  }
}
