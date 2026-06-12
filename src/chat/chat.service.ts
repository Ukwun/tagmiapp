import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common"
import { Not } from "typeorm"
import { StorageService } from "../config/storage.service"
import type { CreateRoomDto } from "./dto/create-room.dto"
import type { CreateMessageDto } from "./dto/create-message.dto"
import { ChatRoomRepository } from "./repositories/chat-room.repository"
import { ChatMessageRepository } from "./repositories/chat-message.repository"
import { UserRepository } from "../users/repositories/user.repository"
import { BookingRepository } from "../bookings/repositories/booking.repository"
import { ChatRoom } from "./entities/chat-room.entity"
import { ChatMessage } from "./entities/chat-message.entity"

@Injectable()
export class ChatService {
  constructor(
    private roomRepository: ChatRoomRepository,
    private messageRepository: ChatMessageRepository,
    private userRepository: UserRepository,
    private bookingRepository: BookingRepository,
    private storageService: StorageService,
  ) {}

  async createRoom(userId: string, createRoomDto: CreateRoomDto): Promise<ChatRoom> {
    const user = await this.userRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException("User not found")
    }

    // If it's a booking room, verify the booking exists and user is involved
    if (createRoomDto.bookingId) {
      const booking = await this.bookingRepository.findOne({
        where: { id: createRoomDto.bookingId },
      })
      if (!booking) {
        throw new NotFoundException("Booking not found")
      }
      if (booking.clientId !== userId && booking.talentId !== userId) {
        throw new ForbiddenException("You are not involved in this booking")
      }
    }

    // Fetch participant users — always include the creator
    const participantIds = createRoomDto.participants || []
    if (!participantIds.includes(userId)) {
      participantIds.push(userId)
    }
    const participants = await this.userRepository.findByIds(participantIds)
    if (participants.length === 0) {
      throw new NotFoundException("No valid participants found")
    }

    const room = this.roomRepository.create({
      name: createRoomDto.name,
      type: createRoomDto.type || "direct",
      bookingId: createRoomDto.bookingId,
      participants,
    })

    return this.roomRepository.save(room)
  }

  async getUserRooms(userId: string): Promise<ChatRoom[]> {
    // Get rooms with participants - join through the junction table
    const allRooms = await this.roomRepository
      .createQueryBuilder("room")
      .innerJoin("room.participants", "participant")
      .leftJoinAndSelect("room.participants", "participants")
      .where("participant.id = :userId", { userId })
      .orderBy("room.updatedAt", "DESC")
      .getMany()

    // Filter out invalid direct rooms (e.g. user is the only participant)
    const rooms = allRooms.filter((room) => {
      if (room.type === "direct" && room.participants.length < 2) return false
      return true
    })

    // For each room, get the last message and unread count for this user
    for (const room of rooms) {
      const lastMessage = await this.messageRepository
        .createQueryBuilder("message")
        .where("message.roomId = :roomId", { roomId: room.id })
        .leftJoinAndSelect("message.sender", "sender")
        .orderBy("message.createdAt", "DESC")
        .limit(1)
        .getOne()

      // Count unread messages for this user in this room (messages from others, not read)
      const unreadCount = await this.messageRepository.count({
        where: {
          roomId: room.id,
          senderId: Not(userId),
          isRead: false,
          isDeleted: false,
        },
      })

      // Attach last message and unread count to room — these are virtual
      // properties declared on the entity, not database columns.
      room.lastMessage = lastMessage
      room.unreadCount = unreadCount
    }

    return rooms
  }

  async joinRoom(roomId: string, userId: string): Promise<ChatRoom> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ["participants"],
    })

    if (!room) {
      throw new NotFoundException("Room not found")
    }

    // Check if user is already a participant
    const isParticipant = room.participants.some((p) => p.id === userId)
    if (!isParticipant) {
      // For booking rooms, verify user is involved in the booking
      if (room.bookingId) {
        const booking = await this.bookingRepository.findOne({
          where: { id: room.bookingId },
        })
        if (!booking || (booking.clientId !== userId && booking.talentId !== userId)) {
          throw new ForbiddenException("You cannot join this room")
        }
      }

      const user = await this.userRepository.findOne({ where: { id: userId } })
      if (user) {
        room.participants.push(user)
        await this.roomRepository.save(room)
      }
    }

    return room
  }

  async getRoomMessages(roomId: string, userId: string, page = 1, limit = 50) {
    // Verify user has access to the room
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
    })

    if (!room) {
      throw new NotFoundException("Room not found")
    }

    const roomWithParticipants = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ["participants"],
    })

    const hasAccess = roomWithParticipants?.participants.some((p) => p.id === userId)
    if (!hasAccess) {
      throw new ForbiddenException("You don't have access to this room")
    }

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { roomId },
      relations: ["sender", "replyTo", "replyTo.sender"],
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    })

    return {
      data: messages.reverse(), // Reverse to show oldest first
      total,
      page,
      limit,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    }
  }

  async createMessage(roomId: string, senderId: string, createMessageDto: CreateMessageDto): Promise<ChatMessage> {
    // Verify user has access to the room
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ["participants"],
    })

    if (!room) {
      throw new NotFoundException("Room not found")
    }

    const hasAccess = room.participants.some((p) => p.id === senderId)
    if (!hasAccess) {
      throw new ForbiddenException("You don't have access to this room")
    }

    const message = this.messageRepository.create({
      roomId,
      senderId,
      content: createMessageDto.content,
      replyToId: createMessageDto.replyToId || null,
    })

    const savedMessage = await this.messageRepository.save(message)

    // Update room's updatedAt
    room.updatedAt = new Date()
    await this.roomRepository.save(room)

    // Return message with sender and replyTo info
    return this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ["sender", "replyTo", "replyTo.sender"],
    })
  }

  // Method for WebSocket to send messages (without DTO)
  async sendMessage(roomId: string, senderId: string, content: string, replyToId?: string): Promise<ChatMessage> {
    return this.createMessage(roomId, senderId, { content, replyToId })
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    })

    if (!message) {
      throw new NotFoundException("Message not found")
    }

    // Verify user has access to the room
    const room = await this.roomRepository.findOne({
      where: { id: message.roomId },
      relations: ["participants"],
    })

    if (!room) {
      throw new NotFoundException("Room not found")
    }

    const hasAccess = room.participants.some((p) => p.id === userId)
    if (!hasAccess) {
      throw new ForbiddenException("You don't have access to this message")
    }

    // Mark message as read
    if (!message.isRead) {
      message.isRead = true
      await this.messageRepository.save(message)
    }
  }

  async getRoomUsers(roomId: string): Promise<string[]> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ["participants"],
    })

    return room?.participants.map((p) => p.id) || []
  }

  async getOrCreateBookingRoom(bookingId: string, userId: string): Promise<ChatRoom> {
    // Check if room already exists for this booking
    let room = await this.roomRepository.findOne({
      where: { bookingId },
    })

    if (room) {
      return room
    }

    // Create new room for the booking
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ["client", "talent"],
    })

    if (!booking) {
      throw new NotFoundException("Booking not found")
    }

    if (booking.clientId !== userId && booking.talentId !== userId) {
      throw new ForbiddenException("You are not involved in this booking")
    }

    room = this.roomRepository.create({
      name: `Booking: ${booking.title}`,
      type: "booking",
      bookingId,
      participants: [booking.client, booking.talent],
    })

    return this.roomRepository.save(room)
  }

  async getOrCreateDirectRoom(userId: string, otherUserId: string): Promise<ChatRoom> {
    if (userId === otherUserId) {
      throw new BadRequestException("Cannot create a chat room with yourself")
    }

    // Check if a direct room already exists between these two users
    // We need to find rooms where BOTH users are participants
    const rooms = await this.roomRepository
      .createQueryBuilder("room")
      .innerJoin("room.participants", "p1")
      .innerJoin("room.participants", "p2")
      .leftJoinAndSelect("room.participants", "participant")
      .where("room.type = :type", { type: "direct" })
      .andWhere("p1.id = :userId", { userId })
      .andWhere("p2.id = :otherUserId", { otherUserId })
      .getMany()

    // For direct rooms, we should have exactly 2 participants
    const existingRoom = rooms.find(room => room.participants.length === 2)

    if (existingRoom) {
      return existingRoom
    }

    // Verify both users exist
    const [user, otherUser] = await Promise.all([
      this.userRepository.findOne({ where: { id: userId } }),
      this.userRepository.findOne({ where: { id: otherUserId } }),
    ])

    if (!user || !otherUser) {
      throw new NotFoundException("User not found")
    }

    // Create new direct room
    const room = this.roomRepository.create({
      name: `${user.displayName} & ${otherUser.displayName}`,
      type: "direct",
      participants: [user, otherUser],
    })

    return this.roomRepository.save(room)
  }

  async editMessage(messageId: string, userId: string, newContent: string): Promise<ChatMessage> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ["sender"],
    })

    if (!message) {
      throw new NotFoundException("Message not found")
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException("You can only edit your own messages")
    }

    if (message.isDeleted) {
      throw new BadRequestException("Cannot edit a deleted message")
    }

    message.content = newContent
    message.isEdited = true
    message.editedAt = new Date()

    return this.messageRepository.save(message)
  }

  async deleteMessage(messageId: string, userId: string): Promise<ChatMessage> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ["sender"],
    })

    if (!message) {
      throw new NotFoundException("Message not found")
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException("You can only delete your own messages")
    }

    message.isDeleted = true
    message.deletedAt = new Date()
    message.content = ""
    message.mediaUrl = null
    message.mediaType = null
    message.fileName = null

    return this.messageRepository.save(message)
  }

  async createMediaMessage(
    roomId: string,
    userId: string,
    file: Express.Multer.File,
    content?: string,
  ): Promise<{ success: boolean; data: ChatMessage }> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ["participants"],
    })

    if (!room) {
      throw new NotFoundException("Room not found")
    }

    const isParticipant = room.participants.some((p) => p.id === userId)
    if (!isParticipant) {
      throw new ForbiddenException("You are not a participant in this room")
    }

    // Determine media type
    let mediaType: string
    if (file.mimetype.startsWith("image/")) {
      mediaType = "image"
    } else if (file.mimetype.startsWith("video/")) {
      mediaType = "video"
    } else if (file.mimetype.startsWith("audio/")) {
      mediaType = "audio"
    } else if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "text/plain" ||
      file.mimetype === "text/csv"
    ) {
      mediaType = "document"
    } else {
      throw new ForbiddenException("Unsupported file type")
    }

    // Upload file — images are compressed to WebP to reduce data consumption
    const uploadResult =
      mediaType === "video"
        ? await this.storageService.uploadVideo(file)
        : mediaType === "image"
          ? await this.storageService.uploadImage(file)
          : await this.storageService.uploadFile(file)

    const message = this.messageRepository.create({
      roomId,
      senderId: userId,
      content: content || "",
      mediaUrl: uploadResult.secure_url,
      mediaType,
      fileName: file.originalname || null,
    })

    const savedMessage = await this.messageRepository.save(message)

    const messageWithSender = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ["sender"],
    })

    return { success: true, data: messageWithSender }
  }
}
