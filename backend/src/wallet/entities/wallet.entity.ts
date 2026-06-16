import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { WalletTransaction } from "./wallet-transaction.entity"

@Entity("wallets")
export class Wallet {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid", unique: true })
  userId: string

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  pendingBalance: number

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  approvedBalance: number

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  withdrawableBalance: number

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  totalEarned: number

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  totalWithdrawn: number

  @Column({ default: false })
  isFrozen: boolean

  @Column({ type: "text", nullable: true })
  freezeReason: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User

  @OneToMany(() => WalletTransaction, (t) => t.wallet)
  transactions: WalletTransaction[]
}
