import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Referral } from "./referral.entity"

export enum ValidationCheckpoint {
  EMAIL_VERIFIED = "email_verified",
  PHONE_VERIFIED = "phone_verified",
  PROFILE_COMPLETED = "profile_completed",
  FOLLOWED_USERS = "followed_users",
  CREATED_CONTENT = "created_content",
  // Kept in enum for PostgreSQL compatibility — not used in validation logic
  SESSION_DAYS = "session_days",
  SESSION_TIME = "session_time",
}

@Entity("referral_validations")
export class ReferralValidation {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  referralId: string

  @Column({
    type: "simple-enum",
    enum: ValidationCheckpoint,
  })
  checkpoint: ValidationCheckpoint

  @Column({ default: false })
  passed: boolean

  @Column({ type: "simple-json", nullable: true })
  evidence: Record<string, any>

  @CreateDateColumn()
  checkedAt: Date

  @ManyToOne(() => Referral, (r) => r.validations)
  @JoinColumn({ name: "referralId" })
  referral: Referral
}


