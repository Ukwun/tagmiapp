import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm"
import { Wallet } from "./wallet.entity"

export enum TransactionType {
  REFERRAL_PENDING = "referral_pending",
  REFERRAL_APPROVED = "referral_approved",
  REFERRAL_REJECTED = "referral_rejected",
  WITHDRAWAL_REQUEST = "withdrawal_request",
  WITHDRAWAL_COMPLETED = "withdrawal_completed",
  WITHDRAWAL_CANCELLED = "withdrawal_cancelled",
  FRAUD_FREEZE = "fraud_freeze",
  FRAUD_REVERSAL = "fraud_reversal",
  ADMIN_ADJUSTMENT = "admin_adjustment",
}

@Entity("wallet_transactions")
@Index(["walletId"])
@Index(["type"])
export class WalletTransaction {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  walletId: string

  @Column({
    type: "simple-enum",
    enum: TransactionType,
  })
  type: TransactionType

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number

  @Column({ type: "decimal", precision: 10, scale: 2 })
  balanceAfter: number

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ type: "uuid", nullable: true })
  referralId: string

  @Column({ nullable: true })
  ip: string

  @Column({ type: "simple-json", nullable: true })
  metadata: Record<string, any>

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => Wallet, (w) => w.transactions)
  @JoinColumn({ name: "walletId" })
  wallet: Wallet
}


