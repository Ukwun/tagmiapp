/**
 * EmailOtp Entity
 *
 * Stores one-time passwords for email verification and password resets.
 * Codes expire after 10 minutes. Once verified, the 'verified' flag is set.
 *
 * Used by: OtpService
 */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"

@Entity("email_otps")
export class EmailOtp {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  email: string

  @Column()
  code: string

  @Column({ default: false })
  verified: boolean

  @Column({ type: "datetime" })
  expiresAt: Date

  @CreateDateColumn()
  createdAt: Date
}

