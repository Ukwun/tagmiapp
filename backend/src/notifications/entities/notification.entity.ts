import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"
import { User } from "../../users/entities/user.entity"

export enum NotificationType {
  LIKE = "like",
  COMMENT = "comment",
  FOLLOW = "follow",
  MESSAGE = "message",
  MENTION = "mention",
  COMMENT_REPLY = "comment_reply",
}

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  userId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User

  @Column()
  actorId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "actorId" })
  actor: User

  @Column({
    type: "enum",
    enum: NotificationType,
  })
  type: NotificationType

  @Column({ nullable: true })
  contentId?: string

  @Column({ nullable: true })
  commentId?: string

  @Column({ nullable: true })
  chatRoomId?: string

  @Column({ type: "text", nullable: true })
  message?: string

  @Column({ default: false })
  read: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
