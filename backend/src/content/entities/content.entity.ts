import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { ContentInteraction } from "./content-interaction.entity"
import { Comment } from "./comment.entity"

@Entity("content")
export class Content {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  userId: string

  @Column({ type: "simple-enum", enum: ["text", "image", "video", "audio"] })
  contentType: "text" | "image" | "video" | "audio"

  @Column({ nullable: true })
  mediaUrl: string

  @Column({ nullable: true })
  thumbnailUrl: string

  @Column({ type: "text", nullable: true })
  caption: string

  @Column({ type: "text", nullable: true })
  textContent: string // Styled text for text-only slides (separate from caption)

  @Column({ nullable: true })
  backgroundColor: string // For text-only posts

  @Column({ nullable: true })
  fontStyle: string // For text posts: normal, bold, italic

  @Column({ type: "simple-array", nullable: true })
  hashtags: string[]

  @Column({ nullable: true })
  duration: number // For video/audio in seconds

  @Column({ nullable: true })
  backgroundMusicUrl: string // Background audio for image/text posts (like Reels)

  // Multi-slide post grouping
  @Column({ nullable: true })
  postId: string // Group content items into a post

  @Column({ default: 0 })
  sortOrder: number // Order within the post (0, 1, 2...)

  // Video splitting support
  @Column({ default: false })
  isSplitVideo: boolean

  @Column({ type: "uuid", nullable: true })
  parentContentId: string

  @Column({ nullable: true })
  sequenceNumber: number // Part 1, 2, 3...

  @Column({ nullable: true })
  totalParts: number

  // Video trim metadata (for auto-split long videos)
  @Column({ type: "float", nullable: true })
  videoTrimStart: number | null

  @Column({ type: "float", nullable: true })
  videoTrimEnd: number | null

  // Engagement metrics
  @Column({ default: 0 })
  viewCount: number

  @Column({ default: 0 })
  likeCount: number

  @Column({ default: 0 })
  commentCount: number

  @Column({ default: 0 })
  shareCount: number

  @Column({ type: "float", default: 0 })
  engagementScore: number

  // Aggregated engagement depth metrics (updated by cron)
  @Column({ type: "float", default: 0 })
  completionRate: number // Avg % of slides viewed per user

  @Column({ type: "float", default: 0 })
  avgWatchTime: number // Avg media progress (0-1) for video/audio

  @Column({ type: "float", default: 0 })
  avgDwellTime: number // Avg dwell time in seconds across all content types

  @Column({ type: "float", default: 0 })
  viralityScore: number // Velocity-based virality detection score

  // AI-generated transcription of audio/video content (from Whisper)
  // Null means not yet analyzed. Empty string means analyzed but no audio found.
  @Column({ type: "text", nullable: true, default: null })
  transcription: string | null

  // AI-generated visual description of image/video content (from BLIP)
  // Null means not yet analyzed. Empty string means analyzed but captioning failed.
  @Column({ type: "text", nullable: true, default: null })
  aiDescription: string | null

  // AI-assigned categories with confidence scores (from categorization service)
  // Only set on the first slide (sortOrder 0) of each post.
  @Column({ type: "jsonb", nullable: true, default: null })
  categories: { category: string; confidence: number }[] | null

  @Column({ default: true })
  isActive: boolean

  @Column({ type: "timestamp", nullable: true })
  scheduledAt: Date | null

  @Column({ default: false })
  isScheduled: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(
    () => User,
    (user) => user.content,
  )
  @JoinColumn({ name: "userId" })
  user: User

  @ManyToOne(
    () => Content,
    { nullable: true }
  )
  @JoinColumn({ name: "parentContentId" })
  parentContent: Content

  @OneToMany(
    () => Content,
    (content) => content.parentContent,
  )
  childParts: Content[]

  @OneToMany(
    () => ContentInteraction,
    (interaction) => interaction.content,
  )
  interactions: ContentInteraction[]

  @OneToMany(
    () => Comment,
    (comment) => comment.content,
  )
  contentComments: Comment[]
}

