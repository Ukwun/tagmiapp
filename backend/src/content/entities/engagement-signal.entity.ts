import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { Content } from "./content.entity"

@Entity("engagement_signals")
@Index(["userId", "contentId"])
@Index(["postId"])
export class EngagementSignal {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  userId: string

  @Column({ type: "uuid" })
  contentId: string

  @Column()
  postId: string

  @Column({ type: "simple-enum", enum: ["video", "audio", "image", "text"] })
  contentType: "video" | "audio" | "image" | "text"

  @Column({ type: "float", default: 0 })
  mediaProgress: number

  @Column({ default: false })
  mediaCompleted: boolean

  @Column({ type: "int", default: 0 })
  dwellTimeMs: number

  @Column({ type: "float", default: 0 })
  scrollDepth: number

  @Column({ type: "int", default: 0 })
  slideIndex: number

  @Column({ type: "int", default: 1 })
  totalSlides: number

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User

  @ManyToOne(() => Content, { onDelete: "CASCADE" })
  @JoinColumn({ name: "contentId" })
  content: Content
}


