/**
 * PersonalizedFeedService
 *
 * Scores and ranks content based on user's category preferences.
 * Implements 70/30 personalized/discovery split to prevent filter bubbles.
 *
 * Algorithm:
 * 1. Fetch candidate posts (last 30 days, visible, not blocked)
 * 2. Score each post based on user's affinity for its categories
 * 3. Sort by score descending
 * 4. Split: 70% top-scored (personalized), 30% random from bottom half (discovery)
 * 5. Interleave for variety (not all top posts first)
 *
 * Scoring formula:
 *   post_score = Σ(category_affinity * category_confidence) / Σ(category_confidence)
 *   + recency_boost
 *
 * Where:
 *   - category_affinity = user's preference for this category (0.0 to 1.0)
 *   - category_confidence = AI's confidence in this categorization (0.0 to 1.0)
 *   - recency_boost = small bonus for newer posts (max 0.1)
 */
import { Injectable } from "@nestjs/common"
import { ContentRepository } from "./repositories/content.repository"
import { UserPreferenceRepository } from "./repositories/user-preference.repository"
import { Content } from "./entities/content.entity"

const PERSONALIZED_RATIO = 0.7 // 70% personalized
const DISCOVERY_RATIO = 0.3 // 30% discovery
const CANDIDATE_WINDOW_DAYS = 30 // Only consider posts from last 30 days
const RECENCY_BOOST_MAX = 0.1 // Max boost for newest posts

interface ScoredPost {
  post: Content
  score: number
}

export interface PaginationDto {
  page?: number
  limit?: number
}

@Injectable()
export class PersonalizedFeedService {
  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly userPreferenceRepository: UserPreferenceRepository,
  ) {}

  /**
   * Generate personalized feed for a user.
   *
   * Returns posts ranked by relevance to user's preferences,
   * with discovery content mixed in to prevent filter bubbles.
   */
  async getPersonalizedFeed(
    userId: number,
    blockedUserIds: number[],
    pagination: PaginationDto,
  ): Promise<Content[]> {
    const { page = 1, limit = 20 } = pagination

    // Fetch user's category preferences
    const preferences = await this.userPreferenceRepository.findByUserId(userId)

    // If no preferences exist, can't personalize yet (fallback to randomized in ContentService)
    if (preferences.length === 0) {
      return []
    }

    // Build affinity map for fast lookup
    const affinityMap = new Map<string, number>()
    for (const pref of preferences) {
      affinityMap.set(pref.category, pref.affinityScore)
    }

    // Fetch candidate posts (last 30 days, not blocked, categorized)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - CANDIDATE_WINDOW_DAYS)

    const candidates = await this.contentRepository
      .createQueryBuilder("content")
      .where("content.createdAt > :cutoff", { cutoff: cutoffDate })
      .andWhere("content.isVisible = :visible", { visible: true })
      .andWhere("content.authorId NOT IN (:...blockedIds)", {
        blockedIds: blockedUserIds.length > 0 ? blockedUserIds : [0],
      })
      .andWhere("content.categories IS NOT NULL")
      .leftJoinAndSelect("content.author", "author")
      .getMany()

    if (candidates.length === 0) {
      return [] // No categorized content to show
    }

    // Score each post
    const scoredPosts = candidates.map(post => ({
      post,
      score: this.scorePost(post, affinityMap),
    }))

    // Sort by score descending
    scoredPosts.sort((a, b) => b.score - a.score)

    // Calculate split
    const personalizedCount = Math.floor(limit * PERSONALIZED_RATIO)
    const discoveryCount = limit - personalizedCount

    // Personalized: top-scored posts
    const personalized = scoredPosts.slice(0, personalizedCount).map(s => s.post)

    // Discovery: random from bottom half (lower-scored content)
    const discoveryPool = scoredPosts.slice(Math.floor(scoredPosts.length / 2))
    const discovery = this.shuffle(discoveryPool)
      .slice(0, discoveryCount)
      .map(s => s.post)

    // Interleave for variety (not all top posts first, not all discovery last)
    const interleaved = this.interleave(personalized, discovery)

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    return interleaved.slice(startIndex, endIndex)
  }

  /**
   * Score a single post based on user's category affinities.
   *
   * Formula:
   *   score = weighted_average(affinity * confidence) + recency_boost
   *
   * Where weighted_average prevents posts with many categories from
   * getting artificially high scores.
   */
  private scorePost(post: Content, affinityMap: Map<string, number>): number {
    const categories = post.categories as Array<{ category: string; confidence: number }> | null

    if (!categories || categories.length === 0) {
      return 0.5 // Neutral score for uncategorized content
    }

    let weightedSum = 0
    let totalConfidence = 0

    for (const cat of categories) {
      // Get user's affinity for this category (default 0.5 if no preference exists)
      const affinity = affinityMap.get(cat.category) ?? 0.5

      // Weight by AI's confidence in this categorization
      weightedSum += affinity * cat.confidence
      totalConfidence += cat.confidence
    }

    // Normalize by total confidence (weighted average)
    const normalizedScore = totalConfidence > 0 ? weightedSum / totalConfidence : 0.5

    // Add recency boost (newer posts get small bonus)
    const ageInDays = (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    const recencyBoost = Math.max(0, RECENCY_BOOST_MAX - ageInDays * 0.01)

    return normalizedScore + recencyBoost
  }

  /**
   * Interleave two arrays for variety.
   * Alternates between personalized and discovery content.
   *
   * Example:
   *   personalized: [A, B, C, D, E, F, G]
   *   discovery:    [X, Y, Z]
   *   result:       [A, X, B, C, Y, D, E, Z, F, G]
   */
  private interleave<T>(arr1: T[], arr2: T[]): T[] {
    const result: T[] = []
    const maxLength = Math.max(arr1.length, arr2.length)

    // Ratio: insert 2 from arr1, then 1 from arr2
    // This maintains ~70/30 split while mixing content
    let i1 = 0
    let i2 = 0

    while (i1 < arr1.length || i2 < arr2.length) {
      // Add 2 from personalized
      if (i1 < arr1.length) result.push(arr1[i1++])
      if (i1 < arr1.length) result.push(arr1[i1++])

      // Add 1 from discovery
      if (i2 < arr2.length) result.push(arr2[i2++])
    }

    return result
  }

  /**
   * Fisher-Yates shuffle algorithm.
   * Randomizes array order in-place.
   */
  private shuffle<T>(array: T[]): T[] {
    const shuffled = [...array] // Clone to avoid mutating original
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
}
