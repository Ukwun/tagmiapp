/**
 * TalentProfile - Stores talent-specific data (services, rates, skills, availability).
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm"
import { User } from "./user.entity"

@Entity("talent_profiles")
export class TalentProfile {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  userId: string

  @Column({ nullable: true })
  displayName: string

  @Column({ nullable: true })
  profileImageUrl: string

  @Column({ nullable: true })
  coverImageUrl: string

  @Column({ type: "text", nullable: true })
  bio: string

  @Column({ type: "simple-json", default: [] })
  skills: string[]

  @Column({ type: "simple-json", default: [] })
  categories: string[]

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  hourlyRate: number

  @Column({ nullable: true })
  location: string

  @Column({ type: "simple-json", default: [] })
  languages: string[]

  @Column({ nullable: true })
  portfolioUrl: string

  @Column({ type: "simple-json", default: {} })
  socialLinks: Record<string, string>

  @Column({ type: "simple-json", default: [] })
  services: { name: string; description: string; price: number }[]

  @Column({ type: "decimal", precision: 3, scale: 2, default: 0 })
  rating: number

  @Column({ default: 0 })
  totalBookings: number

  @Column({ default: 60 }) // in minutes
  responseTime: number

  @Column({
    type: "simple-enum",
    enum: ["available", "busy", "unavailable"],
    default: "available",
  })
  availabilityStatus: "available" | "busy" | "unavailable"

  @Column({ default: false })
  isAvailable: boolean

  @Column({ default: false })
  isBookable: boolean

  @Column({ default: 0 })
  followerCount: number

  @Column({ default: 0 })
  followingCount: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User
}


