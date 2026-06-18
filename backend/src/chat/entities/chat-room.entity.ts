import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { ChatMessage } from "./chat-message.entity"

@Entity("chat_rooms")
export class ChatRoom {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column({ type: "simple-enum", enum: ["direct", "group", "booking"], default: "direct" })
  type: "direct" | "group" | "booking"

  @Column("uuid", { nullable: true })
  bookingId: string | null

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToMany(() => User)
  @JoinTable({
    name: "chat_room_participants",
    joinColumn: { name: "roomId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "userId", referencedColumnName: "id" },
  })
  participants: User[]

  @OneToMany(() => ChatMessage, (message) => message.room)
  messages: ChatMessage[]

  // Not a database column — populated at runtime by ChatService.getUserRooms()
  // so the room list can show a message preview without extra queries.
  lastMessage?: any

  // Not a database column — populated at runtime by ChatService.getUserRooms().
  // Number of messages the current user has not read yet in this room.
  unreadCount?: number
}
