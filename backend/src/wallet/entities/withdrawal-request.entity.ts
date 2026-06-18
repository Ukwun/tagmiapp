import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm"
import { User } from "../../users/entities/user.entity"

export enum WithdrawalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  PROCESSING = "processing",
  COMPLETED = "completed",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

@Entity("withdrawal_requests")
@Index(["userId"])
@Index(["status"])
export class WithdrawalRequest {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  userId: string

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number

  @Column({
    type: "simple-enum",
    enum: WithdrawalStatus,
    default: WithdrawalStatus.PENDING,
  })
  status: WithdrawalStatus

  @Column({ nullable: true })
  stripePayoutId: string

  @Column({ type: "text", nullable: true })
  rejectionReason: string

  @Column({ type: "text", nullable: true })
  adminNotes: string

  @Column({ nullable: true })
  processedBy: string

  @Column({ type: "datetime", nullable: true })
  processedAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User
}



