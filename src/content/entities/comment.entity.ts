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
import { Content } from "./content.entity"

@Entity("comments")
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  userId: string

  @Column("uuid")
  contentId: string

  @Column({ type: "text" })
  text: string

  @Column({ type: "uuid", nullable: true })
  parentId: string // for replies

  @Column({ default: 0 })
  likes: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User

  @ManyToOne(
    () => Content,
    (content) => content.contentComments,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "contentId" })
  content: Content

  @ManyToOne(
    () => Comment,
    (comment) => comment.replies,
  )
  @JoinColumn({ name: "parentId" })
  parent: Comment

  @OneToMany(
    () => Comment,
    (comment) => comment.parent,
  )
  replies: Comment[]
}
