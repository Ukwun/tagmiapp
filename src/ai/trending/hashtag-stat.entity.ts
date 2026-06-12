import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("hashtag_stats")
export class HashtagStat {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  hashtag: string

  @Column({ default: 0 })
  postCount: number

  @Column({ default: 0 })
  recentPostCount1h: number

  @Column({ default: 0 })
  recentPostCount6h: number

  @Column({ default: 0 })
  recentPostCount24h: number

  @Column({ type: "float", default: 0 })
  trendScore: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
