import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm"

@Entity("phone_verifications")
@Index(["phoneHash"], { unique: true })
@Index(["userId"])
export class PhoneVerification {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  userId: string

  @Column()
  phoneHash: string

  @Column({ default: false })
  verified: boolean

  @Column({ nullable: true })
  otpHash: string

  @Column({ type: "timestamp", nullable: true })
  otpExpiresAt: Date

  @Column({ default: 0 })
  attemptCount: number

  @CreateDateColumn()
  createdAt: Date
}
