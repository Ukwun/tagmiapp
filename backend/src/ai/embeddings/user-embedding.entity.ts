import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("user_embeddings")
export class UserEmbedding {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid", { unique: true })
  userId: string

  @Column("text")
  embedding: string // Stored as JSON array string, parsed to float[] at runtime

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
