/**
 * UserPreferenceRepository
 *
 * Handles all database operations for user category preferences.
 * This is the only place that talks to the user_category_preference table.
 *
 * Key operations:
 * - Find user's preferences (for feed scoring)
 * - Upsert preference after engagement (update if exists, create if not)
 * - Seed preferences from signup interests (one-time initialization)
 * - Get top N preferences (for debugging/analytics)
 */
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, FindOptionsWhere, SelectQueryBuilder } from "typeorm"
import { UserCategoryPreference } from "../entities/user-category-preference.entity"

@Injectable()
export class UserPreferenceRepository {
  constructor(
    @InjectRepository(UserCategoryPreference)
    private readonly repository: Repository<UserCategoryPreference>,
  ) {}

  /**
   * Find all preferences for a user.
   * Returns empty array if user has no preferences yet.
   */
  async findByUserId(userId: string): Promise<UserCategoryPreference[]> {
    return this.repository.find({
      where: { userId },
      order: { affinityScore: "DESC" },
    })
  }

  /**
   * Find a specific user-category preference.
   * Returns null if it doesn't exist.
   */
  async findOne(userId: string, category: string): Promise<UserCategoryPreference | null> {
    return this.repository.findOne({
      where: { userId, category },
    })
  }

  /**
   * Create a new preference record.
   */
  async create(data: Partial<UserCategoryPreference>): Promise<UserCategoryPreference> {
    const preference = this.repository.create(data)
    return this.repository.save(preference)
  }

  /**
   * Update an existing preference.
   */
  async update(id: number, data: Partial<UserCategoryPreference>): Promise<void> {
    await this.repository.update(id, data)
  }

  /**
   * Update or insert a preference (atomic operation).
   * If the preference exists, updates it. Otherwise creates it.
   */
  async upsert(userId: string, category: string, data: Partial<UserCategoryPreference>): Promise<void> {
    await this.repository.upsert(
      {
        userId,
        category,
        ...data,
      },
      ["userId", "category"], // Conflict columns (unique constraint)
    )
  }

  /**
   * Get user's top N preferred categories.
   * Used for analytics and debugging.
   */
  async getTopPreferences(userId: string, limit: number = 10): Promise<UserCategoryPreference[]> {
    return this.repository.find({
      where: { userId },
      order: { affinityScore: "DESC" },
      take: limit,
    })
  }

  /**
   * Seed preferences from user's signup interests.
   * Called once when user signs up or first requests feed.
   *
   * Sets affinity_score = 0.7 for selected interests (higher than neutral 0.5).
   * All other categories default to 0.5 when first encountered.
   */
  async seedFromInterests(userId: string, interests: string[]): Promise<void> {
    if (!interests || interests.length === 0) return

    const preferences = interests.map((category) => ({
      userId,
      category,
      affinityScore: 0.7, // Initial boost for selected interests
      engagementCount: 0, // Not from actual engagement yet
      lastEngagementAt: null,
    }))

    // Use upsert in case user already has some preferences
    for (const pref of preferences) {
      await this.upsert(userId, pref.category, pref)
    }
  }

  /**
   * Delete all preferences for a user.
   * Used when user wants to reset their personalization.
   */
  async deleteByUserId(userId: string): Promise<void> {
    await this.repository.delete({ userId })
  }

  /**
   * Create a query builder for complex queries.
   * Used by analytics and reporting endpoints.
   */
  createQueryBuilder(alias: string = "preference"): SelectQueryBuilder<UserCategoryPreference> {
    return this.repository.createQueryBuilder(alias)
  }
}
