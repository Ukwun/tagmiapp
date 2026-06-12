import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { ChatRoom } from "./chat-room.entity"

@Entity("chat_messages")
export class ChatMessage {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  roomId: string

  @Column("uuid")
  senderId: string

  @Column("text")
  content: string

  @Column({ nullable: true })
  mediaUrl: string

  @Column({ nullable: true })
  mediaType: string // 'image' | 'video' | 'audio' | 'document' | 'file'

  @Column({ nullable: true })
  fileName: string

  @Column({ default: false })
  isRead: boolean

  @Column({ type: "uuid", nullable: true })
  replyToId: string

  @Column({ default: false })
  isEdited: boolean

  @Column({ type: "timestamp", nullable: true })
  editedAt: Date | null

  @Column({ default: false })
  isDeleted: boolean

  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => ChatRoom, (room) => room.messages)
  @JoinColumn({ name: "roomId" })
  room: ChatRoom

  @ManyToOne(() => User)
  @JoinColumn({ name: "senderId" })
  sender: User

  @ManyToOne(() => ChatMessage, { nullable: true })
  @JoinColumn({ name: "replyToId" })
  replyTo: ChatMessage
}