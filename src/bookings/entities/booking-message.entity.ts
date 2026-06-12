import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { Booking } from "./booking.entity"

@Entity("booking_messages")
export class BookingMessage {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  bookingId: string

  @Column("uuid")
  senderId: string

  @Column("text")
  content: string

  @Column({ default: false })
  isRead: boolean

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => Booking)
  @JoinColumn({ name: "bookingId" })
  booking: Booking

  @ManyToOne(() => User)
  @JoinColumn({ name: "senderId" })
  sender: User
}