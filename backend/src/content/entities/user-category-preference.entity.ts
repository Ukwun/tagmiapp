/**
 * UserCategoryPreference Entity
 *
 * Tracks a user's affinity for each content category (0.0 to 1.0).
 * Updated in real-time as users engage with content.
 *
 * The affinity score represents how much the user likes this category:
 * - 0.0 = strong dislike (skip, hide)
 * - 0.5 = neutral (no engagement history)
 * - 0.7 = initial seed value (selected during signup)
 * - 1.0 = strong like (high engagement, completion rate)
 *
 * Updated using exponential moving average to prevent single events
 * from drastically changing preferences.
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from "typeorm"

@Entity("user_category_preference")
@Unique(["userId", "category"])
@Index(["userId"])
@Index(["affinityScore"])
export class UserCategoryPreference {
  @PrimaryGeneratedColumn()
  id: number

  // Which user this preference belongs to (UUID string)
  @Column({ name: "user_id", type: "uuid" })
  userId: string

  // Category name (Music, Comedy, Fashion, etc.)
  // Must match one of the 24 categories from MediaAnalysisService
  @Column({ length: 50 })
  category: string

  // Affinity score: 0.0 (dislike) to 1.0 (strong like)
  // Default 0.5 = neutral
  @Column({
    type: "decimal",
    precision: 4,
    scale: 3,
    default: 0.5,
    name: "affinity_score",
  })
  affinityScore: number

  // How many times the user has engaged with this category
  // Used to determine if preference is established or just noise
  @Column({ default: 0, name: "engagement_count" })
  engagementCount: number

  // When the user last engaged with content in this category
  // Used for decay (categories not engaged with for 30+ days drift back to neutral)
  @Column({ type: "datetime", nullable: true, name: "last_engagement_at" })
  lastEngagementAt: Date | null

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}
