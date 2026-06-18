/**
 * ClientProfile - Stores client-specific preferences and booking history.
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

@Entity("client_profiles")
export class ClientProfile {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  userId: string

  @Column({ nullable: true })
  companyName: string

  @Column({ nullable: true })
  industry: string

  @Column({ nullable: true })
  companySize: string // 'solo', 'small', 'medium', 'large'

  @Column({ type: "text", nullable: true })
  companyDescription: string

  @Column({ nullable: true })
  website: string

  @Column({ type: "simple-json", default: [] })
  preferredCategories: string[] // Talent categories they're interested in

  @Column({ type: "simple-json", default: [] })
  preferredSkills: string[] // Skills they frequently look for

  @Column({ default: 0 })
  totalBookings: number

  @Column({ default: 0 })
  completedBookings: number

  @Column({ type: "decimal", precision: 3, scale: 2, default: 0 })
  rating: number // Client rating from talents

  @Column({ default: 0 })
  totalSpent: number // Total amount spent on bookings

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User
}


