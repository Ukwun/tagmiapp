import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm"
import { User } from "../../users/entities/user.entity"

export enum ReportType {
  USER = "user",
  POST = "post",
  COMMENT = "comment",
}

export enum ReportReason {
  SPAM = "spam",
  HARASSMENT = "harassment",
  HATE_SPEECH = "hate_speech",
  VIOLENCE = "violence",
  NUDITY = "nudity",
  FALSE_INFO = "false_info",
  SCAM = "scam",
  OTHER = "other",
}

export enum ReportStatus {
  PENDING = "pending",
  REVIEWED = "reviewed",
  RESOLVED = "resolved",
  DISMISSED = "dismissed",
}

@Entity("reports")
export class Report {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  reporterId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "reporterId" })
  reporter: User

  @Column({
    type: "simple-enum",
    enum: ReportType,
  })
  type: ReportType

  @Column({
    type: "simple-enum",
    enum: ReportReason,
  })
  reason: ReportReason

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ nullable: true })
  targetUserId: string

  @Column({ nullable: true })
  targetPostId: string

  @Column({ nullable: true })
  targetCommentId: string

  @Column({
    type: "simple-enum",
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus

  @CreateDateColumn()
  createdAt: Date
}

