/**
 * PersonalizedFeedService
 *
 * Scores and ranks content based on user's category preferences.
 * Implements a 70/30 split: 70% personalized (top-scored), 30% discovery (random).
 *
 * Scoring formula:
 *   post_score = Σ(affinity * confidence) / Σ(confidence) + recency_boost
 *
 * Where:
 *   - affinity = user's preference for this category (0.0 to 1.0)
 *   - confidence = AI's confidence that content belongs to this category (0.0 to 1.0)
 *   - recency_boost = small bonus for newer posts (max 0.1, decays over time)
 *
 * Discovery pool prevents filter bubbles by showing content from categories
 * the user hasn't engaged with much.
 */
import { Injectable, Logger } from "@nestjs/common"
import { In, Not } from "typeorm"
import { ContentRepository } from "./repositories/content.repository"
import { UserPreferenceRepository } from "./repositories/user-preference.repository"
import { Content } from "./entities/content.entity"

// 70% personalized, 30% discovery
const PERSONALIZED_RATIO = 0.7
const DISCOVERY_RATIO = 0.3

// Recency boost: newer posts get a small bonus (max 0.1)
// Decays by 0.01 per day
const RECENCY_BOOST_MAX = 0.1

// How far back to look for feed candidates (days)
const FEED_LOOKBACK_DAYS = 30

interface PaginationDto {
  page: number
  limit: number
}

@Injectable()
export class PersonalizedFeedService {
  private readonly logger = new Logger(PersonalizedFeedService.name)

  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly userPreferenceRepository: UserPreferenceRepository,
  ) {}

  /**
   * Get personalized feed for a user.
   *
   * Algorithm:
   * 1. Fetch user's category preferences (affinity scores)
   * 2. Get candidate posts from last 30 days with categories
   * 3. Score each post based on user's affinity for its categories
   * 4. Sort by score descending
   * 5. Split: 70% top-scored (personalized), 30% random from bottom half (discovery)
   * 6. Interleave for variety (2 personalized, 1 discovery pattern)
   *
   * Returns empty array if user has no preferences (graceful fallback).
   */
  async getPersonalizedFeed(
    userId: string,
    blockedUserIds: string[],
    pagination: PaginationDto,
  ): Promise<Content[]> {
    // Fetch user's preferences
    const preferences = await this.userPreferenceRepository.findByUserId(userId)

    if (preferences.length === 0) {
      // User has no preferences yet, return empty (caller should fall back to randomized feed)
      return []
    }

    // Build affinity map for fast lookup
    const affinityMap = new Map<string, number>()
    for (const pref of preferences) {
      affinityMap.set(pref.category, pref.affinityScore)
    }

    // Fetch candidate posts: last 30 days, categorized, not blocked, visible
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - FEED_LOOKBACK_DAYS)

    const candidates = await this.contentRepository.find({
      where: {
        createdAt: Not(null),
        categories: Not(null),
        isActive: true,
        sortOrder: 0, // Only first slides (represent posts)
        ...(blockedUserIds.length > 0 && { userId: Not(In(blockedUserIds.map(String))) }),
      },
      order: { createdAt: "DESC" },
      take: 1000, // Limit candidates to avoid memory issues (top 1000 most recent)
    })

    // Filter candidates to only those created after cutoff
    const recentCandidates = candidates.filter((c) => c.createdAt >= cutoffDate)

    if (recentCandidates.length === 0) {
      return []
    }

    // Score each post
    const scoredPosts = recentCandidates
      .map((post) => {
        const score = this.scorePost(post, affinityMap)
        return { post, score }
      })
      .filter((item) => item.score > 0) // Remove posts with no matching categories

    // Sort by score descending
    scoredPosts.sort((a, b) => b.score - a.score)

    // Calculate 70/30 split
    const totalNeeded = pagination.limit
    const personalizedCount = Math.floor(totalNeeded * PERSONALIZED_RATIO)
    const discoveryCount = totalNeeded - personalizedCount

    // Top N = personalized
    const personalized = scoredPosts.slice(0, personalizedCount).map((item) => item.post)

    // Discovery pool = bottom half (lower-scored content)
    const discoveryPool = scoredPosts.slice(Math.floor(scoredPosts.length / 2))
    const discovery = this.shuffle(discoveryPool)
      .slice(0, discoveryCount)
      .map((item) => item.post)

    // Interleave: 2 personalized, 1 discovery pattern
    const feed = this.interleave(personalized, discovery)

    // Apply pagination
    const start = (pagination.page - 1) * pagination.limit
    const end = start + pagination.limit

    return feed.slice(start, end)
  }

  /**
   * Score a post based on user's affinity for its categories.
   *
   * Formula: weighted average of affinities, plus recency boost.
   */
  private scorePost(post: Content, affinityMap: Map<string, number>): number {
    const categories = post.categories as Array<{ category: string; confidence: number }> | null

    if (!categories || categories.length === 0) {
      return 0
    }

    let weightedSum = 0
    let totalConfidence = 0

    for (const cat of categories) {
      const affinity = affinityMap.get(cat.category) ?? 0.5 // Default to neutral if not found
      weightedSum += affinity * cat.confidence
      totalConfidence += cat.confidence
    }

    // Normalize by total confidence (weighted average)
    const normalizedScore = totalConfidence > 0 ? weightedSum / totalConfidence : 0.5

    // Add recency boost: newer posts get small bonus
    const ageInDays = (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    const recencyBoost = Math.max(0, RECENCY_BOOST_MAX - ageInDays * 0.01)

    return normalizedScore + recencyBoost
  }

  /**
   * Interleave two arrays with a 2:1 pattern.
   * Example: [p1, p2, d1, p3, p4, d2, p5, p6, d3, ...]
   */
  private interleave(personalized: Content[], discovery: Content[]): Content[] {
    const result: Content[] = []
    let pIndex = 0
    let dIndex = 0

    while (pIndex < personalized.length || dIndex < discovery.length) {
      // Add 2 personalized
      if (pIndex < personalized.length) {
        result.push(personalized[pIndex++])
      }
      if (pIndex < personalized.length) {
        result.push(personalized[pIndex++])
      }

      // Add 1 discovery
      if (dIndex < discovery.length) {
        result.push(discovery[dIndex++])
      }
    }

    return result
  }

  /**
   * Fisher-Yates shuffle.
   */
  private shuffle<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
}
