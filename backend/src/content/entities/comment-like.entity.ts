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
import { Comment } from "./comment.entity"

@Entity("comment_likes")
@Index(["commentId", "userId"], { unique: true }) // Prevent duplicate likes
export class CommentLike {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  commentId: string

  @Column({ type: "uuid" })
  userId: string

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => Comment, { onDelete: "CASCADE" })
  @JoinColumn({ name: "commentId" })
  comment: Comment

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User
}
