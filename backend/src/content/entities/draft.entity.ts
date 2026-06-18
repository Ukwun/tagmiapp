import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { User } from "../../users/entities/user.entity"

export interface DraftSlide {
  type: "image" | "video" | "text"
  mediaUrl?: string
  caption?: string
  text?: string
  backgroundColor?: string
  fontStyle?: string
  backgroundMusicUrl?: string
  musicName?: string
  musicTrimStart?: number
  musicTrimEnd?: number
  hasMediaFile?: boolean
  hasMusicFile?: boolean
  sortOrder: number
}

@Entity("drafts")
export class Draft {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  userId: string

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User

  @Column({ type: "simple-json" })
  slides: DraftSlide[]

  @Column({ type: "simple-array", nullable: true })
  hashtags: string[]

  @Column({ default: "saved" })
  status: string // "saving" | "saved" | "failed"

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

