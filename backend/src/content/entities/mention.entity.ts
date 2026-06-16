import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm"
import { User } from "../../users/entities/user.entity"
import { Content } from "./content.entity"
import { Comment } from "./comment.entity"

@Entity("mentions")
export class Mention {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  mentionedUserId: string

  @Column({ type: "uuid" })
  mentionedByUserId: string

  @Column({ type: "uuid", nullable: true })
  contentId: string

  @Column({ type: "uuid", nullable: true })
  commentId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "mentionedUserId" })
  mentionedUser: User

  @ManyToOne(() => User)
  @JoinColumn({ name: "mentionedByUserId" })
  mentionedByUser: User

  @ManyToOne(() => Content, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "contentId" })
  content: Content

  @ManyToOne(() => Comment, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "commentId" })
  comment: Comment

  @CreateDateColumn()
  createdAt: Date
}
