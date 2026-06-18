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

  @Column({ type: "uuid" })
  userId: string

  @Column()
  phoneHash: string

  @Column({ default: false })
  verified: boolean

  @Column({ nullable: true })
  otpHash: string

  @Column({ type: "datetime", nullable: true })
  otpExpiresAt: Date

  @Column({ default: 0 })
  attemptCount: number

  @CreateDateColumn()
  createdAt: Date
}


