import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { ReferralValidation } from "./referral-validation.entity"

export enum ReferralStatus {
  CLICKED = "clicked",
  REGISTERED = "registered",
  VALIDATING = "validating",
  VALIDATED = "validated",
  CREDITED = "credited",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

@Entity("referrals")
@Index(["referrerId"])
@Index(["referredUserId"])
@Index(["status"])
export class Referral {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  referrerId: string

  @Column({ type: "uuid", nullable: true })
  referredUserId: string

  @Column()
  referralCode: string

  @Column({
    type: "simple-enum",
    enum: ReferralStatus,
    default: ReferralStatus.CLICKED,
  })
  status: ReferralStatus

  @Column({ default: 0 })
  creditsAwarded: number

  @Column({ nullable: true })
  clickIp: string

  @Column({ nullable: true })
  registrationIp: string

  @Column({ nullable: true })
  deviceFingerprintHash: string

  @Column({ nullable: true })
  userAgent: string

  @Column({ type: "datetime", nullable: true })
  validationDeadline: Date

  @Column({ type: "text", nullable: true })
  rejectionReason: string

  @Column({ type: "simple-json", nullable: true })
  metadata: Record<string, any>

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: "referrerId" })
  referrer: User

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "referredUserId" })
  referredUser: User

  @OneToMany(() => ReferralValidation, (v) => v.referral)
  validations: ReferralValidation[]
}




