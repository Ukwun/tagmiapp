/**
 * UserSettings - Privacy, notification, and booking preferences per user.
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

@Entity("user_settings")
export class UserSettings {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid", { unique: true })
  userId: string

  // Notification settings
  @Column({ default: true })
  emailMessages: boolean

  @Column({ default: false })
  pushMessages: boolean

  @Column({ default: false })
  marketingEmails: boolean

  // Privacy settings
  @Column({ default: true })
  profileVisible: boolean

  @Column({ default: true })
  showLocation: boolean

  @Column({ default: true })
  showRates: boolean

  // Booking settings (talent-specific)
  @Column({ default: false })
  autoAcceptBookings: boolean

  @Column({ default: true })
  requireDeposit: boolean

  @Column({ default: 24 })
  advanceNotice: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User
}
