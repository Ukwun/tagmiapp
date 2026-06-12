import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { User } from "../../users/entities/user.entity"
import { Content } from "./content.entity"

@Entity("content_interactions")
export class ContentInteraction {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  userId: string

  @Column("uuid")
  contentId: string

  @Column({ type: "enum", enum: ["like", "view", "share", "comment", "bookmark"] })
  type: "like" | "view" | "share" | "comment" | "bookmark"

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User

  @ManyToOne(
    () => Content,
    (content) => content.interactions,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "contentId" })
  content: Content
}
