import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { User } from "../../users/entities/user.entity"

@Entity("bookings")
export class Booking {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  clientId: string

  @Column("uuid")
  talentId: string

  @Column()
  title: string

  @Column({
    type: "enum",
    enum: ["pending", "accepted", "rejected", "in_progress", "completed", "cancelled", "paid"],
    default: "pending",
  })
  status: "pending" | "accepted" | "rejected" | "in_progress" | "completed" | "cancelled" | "paid"

  @Column("text")
  description: string

  @Column({ nullable: true })
  bookingType: string // 'event', 'photoshoot', 'performance', etc.

  @Column({ nullable: true })
  location: string

  @Column("decimal", { precision: 10, scale: 2 })
  price: number

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  finalAmount: number // Amount after negotiation

  @Column("timestamp")
  startDate: Date

  @Column("timestamp", { nullable: true })
  endDate: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: "clientId" })
  client: User

  @ManyToOne(() => User)
  @JoinColumn({ name: "talentId" })
  talent: User
}