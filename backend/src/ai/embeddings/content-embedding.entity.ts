import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"

@Entity("content_embeddings")
export class ContentEmbedding {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid", { unique: true })
  contentId: string

  @Column("text")
  embedding: string // Stored as JSON array string, parsed to float[] at runtime

  @CreateDateColumn()
  createdAt: Date
}
