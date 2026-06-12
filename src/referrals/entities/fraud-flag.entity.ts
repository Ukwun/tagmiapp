import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { Referral } from "./referral.entity"

export enum FraudFlagType {
  DUPLICATE_DEVICE = "duplicate_device",
  SAME_IP_SUBNET = "same_ip_subnet",
  VPN_PROXY = "vpn_proxy",
  RAPID_SIGNUPS = "rapid_signups",
  SIMILAR_CREDENTIALS = "similar_credentials",
  LOW_SESSION_QUALITY = "low_session_quality",
  VELOCITY_EXCEEDED = "velocity_exceeded",
  CIRCULAR_REFERRAL = "circular_referral",
  PHONE_REUSE = "phone_reuse",
  COLLUSION_PATTERN = "collusion_pattern",
}

export enum FraudFlagSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum FraudFlagStatus {
  OPEN = "open",
  INVESTIGATING = "investigating",
  CONFIRMED = "confirmed",
  DISMISSED = "dismissed",
}

@Entity("fraud_flags")
@Index(["userId"])
@Index(["referralId"])
@Index(["status"])
export class FraudFlag {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid", nullable: true })
  userId: string

  @Column({ type: "uuid", nullable: true })
  referralId: string

  @Column({
    type: "enum",
    enum: FraudFlagType,
  })
  type: FraudFlagType

  @Column({
    type: "enum",
    enum: FraudFlagSeverity,
    default: FraudFlagSeverity.MEDIUM,
  })
  severity: FraudFlagSeverity

  @Column({
    type: "enum",
    enum: FraudFlagStatus,
    default: FraudFlagStatus.OPEN,
  })
  status: FraudFlagStatus

  @Column({ type: "text" })
  description: string

  @Column({ type: "jsonb", nullable: true })
  evidence: Record<string, any>

  @Column({ type: "text", nullable: true })
  resolution: string

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "userId" })
  user: User

  @ManyToOne(() => Referral, { nullable: true })
  @JoinColumn({ name: "referralId" })
  referral: Referral
}
