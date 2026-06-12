/**
 * UserPreferenceRepository
 *
 * Repository for user category preferences.
 * Handles CRUD operations for preference tracking.
 *
 * This is the only place that touches the user_category_preference table directly.
 */
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { UserCategoryPreference } from "../entities/user-category-preference.entity"

export interface IUserPreferenceRepository {
  findByUserId(userId: number): Promise<UserCategoryPreference[]>
  findOne(userId: number, category: string): Promise<UserCategoryPreference | null>
  create(data: Partial<UserCategoryPreference>): Promise<UserCategoryPreference>
  update(id: number, data: Partial<UserCategoryPreference>): Promise<void>
  upsert(userId: number, category: string, data: Partial<UserCategoryPreference>): Promise<UserCategoryPreference>
  getTopPreferences(userId: number, limit: number): Promise<UserCategoryPreference[]>
  seedFromInterests(userId: number, interests: string[]): Promise<void>
}

@Injectable()
export class UserPreferenceRepository implements IUserPreferenceRepository {
  constructor(
    @InjectRepository(UserCategoryPreference)
    private readonly repository: Repository<UserCategoryPreference>,
  ) {}

  /**
   * Fetch all preferences for a user.
   * Used by PersonalizedFeedService to score content.
   */
  async findByUserId(userId: number): Promise<UserCategoryPreference[]> {
    return this.repository.find({
      where: { userId },
      order: { affinityScore: "DESC" },
    })
  }

  /**
   * Find a specific preference by user and category.
   * Returns null if not found.
   */
  async findOne(userId: number, category: string): Promise<UserCategoryPreference | null> {
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
   * Update an existing preference record.
   */
  async update(id: number, data: Partial<UserCategoryPreference>): Promise<void> {
    await this.repository.update(id, data)
  }

  /**
   * Upsert a preference record (create if doesn't exist, update if exists).
   * Used by learning service to update preferences atomically.
   */
  async upsert(
    userId: number,
    category: string,
    data: Partial<UserCategoryPreference>,
  ): Promise<UserCategoryPreference> {
    const existing = await this.findOne(userId, category)

    if (existing) {
      await this.update(existing.id, data)
      return this.repository.findOne({ where: { id: existing.id } })!
    }

    return this.create({
      userId,
      category,
      ...data,
    })
  }

  /**
   * Get top N categories for a user by affinity score.
   * Used for analytics and debugging.
   */
  async getTopPreferences(userId: number, limit: number): Promise<UserCategoryPreference[]> {
    return this.repository.find({
      where: { userId },
      order: { affinityScore: "DESC" },
      take: limit,
    })
  }

  /**
   * Seed initial preferences from user's signup interests.
   * Called once when user signs up or first requests personalized feed.
   *
   * Sets affinity_score = 0.7 for selected interests.
   * All other categories start at 0.5 (neutral) and are created on first engagement.
   */
  async seedFromInterests(userId: number, interests: string[]): Promise<void> {
    // Check if already seeded (any preferences exist)
    const existing = await this.repository.count({ where: { userId } })
    if (existing > 0) {
      return // Already seeded
    }

    // Create preference records for selected interests only
    const preferences = interests.map(category => ({
      userId,
      category,
      affinityScore: 0.7, // Higher than neutral (0.5) to indicate preference
      engagementCount: 0,
      lastEngagementAt: null,
    }))

    if (preferences.length > 0) {
      await this.repository.save(preferences)
    }
  }
}
