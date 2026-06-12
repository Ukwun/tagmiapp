import {
  WebSocketGateway,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  type OnGatewayInit,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets"
import type { Server, Socket } from "socket.io"
import { UseGuards, Inject, forwardRef } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { ChatService } from "./chat.service"
import { NotificationsService } from "../notifications/notifications.service"
import type { CreateMessageDto } from "./dto/create-message.dto"

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(",") || [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server

  private userSockets = new Map<string, string>() // userId -> socketId

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  afterInit(server: Server) {
    // Register socket server with NotificationsService for real-time push
    this.notificationsService.setSocketServer(server)
  }

  async handleConnection(client: Socket) {
    try {
      const userId = await this.validateConnection(client)
      if (userId) {
        client.data.userId = userId
        this.userSockets.set(userId, client.id)
        client.join(`user:${userId}`)
        console.log(`User ${userId} connected with socket ${client.id}`)
      } else {
        console.log("Connection rejected: Invalid authentication")
        client.disconnect()
      }
    } catch (error) {
      console.error("Connection error:", error)
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    // Find and remove user from userSockets map
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId)
        console.log(`User ${userId} disconnected`)
        break
      }
    }
  }

  private async validateConnection(client: Socket): Promise<string | null> {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(" ")[1]
      if (!token) {
        throw new Error("No token provided")
      }

      // Here you would validate the JWT token and extract user ID
      // For now, we'll assume the token contains the user ID
      const userId = await this.extractUserIdFromToken(token)
      return userId
    } catch (error) {
      console.error("Token validation failed:", error)
      return null
    }
  }

  private async extractUserIdFromToken(token: string): Promise<string> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || "your-secret-key",
      })
      return payload.sub || payload.id
    } catch (error) {
      throw new Error("Invalid token")
    }
  }

  @SubscribeMessage("joinRoom")
  handleJoinRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
    try {
      const userId = client.data.userId || "unknown"

      client.join(`room:${roomId}`)
      client.emit("joinedRoom", { roomId })

      // Notify other users in the room
      client.to(`room:${roomId}`).emit("userJoined", { userId, roomId })
    } catch (error) {
      client.emit("error", { message: error.message })
    }
  }

  @SubscribeMessage("leaveRoom")
  handleLeaveRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
    try {
      const userId = client.data.userId || "unknown"

      client.leave(`room:${roomId}`)
      client.emit("leftRoom", { roomId })

      // Notify other users in the room
      client.to(`room:${roomId}`).emit("userLeft", { userId, roomId })
    } catch (error) {
      client.emit("error", { message: error.message })
    }
  }

  @SubscribeMessage("sendMessage")
  async handleMessage(
    @MessageBody() data: { roomId: string; content: string; replyToId?: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const userId = client.data.userId || "unknown"

      // Save message to database via service
      const savedMessage = await this.chatService.sendMessage(data.roomId, userId, data.content, data.replyToId)

      // Send message to all users in the room including sender
      this.server.to(`room:${data.roomId}`).emit("newMessage", savedMessage)

      // Also emit to each participant's user channel for unread count on other pages
      try {
        const roomUsers = await this.chatService.getRoomUsers(data.roomId)
        for (const uid of roomUsers) {
          if (uid !== userId) {
            this.server.to(`user:${uid}`).emit("newMessage", savedMessage)
          }
        }
      } catch {}

      // Send in-app notification to other participants
      this.notifyRoomParticipants(data.roomId, userId, data.content)
    } catch (error) {
      console.error("Error sending message:", error)
      client.emit("error", { message: error.message })
    }
  }

  @SubscribeMessage("markAsRead")
  async handleMarkAsRead(
    @MessageBody() data: { roomId: string; messageId: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const userId = client.data.userId || "unknown"

      // Persist read status to database
      await this.chatService.markMessageAsRead(data.messageId, userId)

      // Notify sender that message was read
      this.server.to(`room:${data.roomId}`).emit("messageRead", {
        messageId: data.messageId,
        readBy: userId,
      })
    } catch (error) {
      client.emit("error", { message: error.message })
    }
  }

  @SubscribeMessage("typing")
  handleTyping(
    @MessageBody() data: { roomId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const userId = client.data.userId || "unknown"

      // Broadcast typing status to other users in the room
      client.to(`room:${data.roomId}`).emit("userTyping", {
        userId,
        isTyping: data.isTyping,
      })
    } catch (error) {
      client.emit("error", { message: error.message })
    }
  }

  @SubscribeMessage("editMessage")
  async handleEditMessage(
    @MessageBody() data: { roomId: string; messageId: string; content: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const userId = client.data.userId || "unknown"
      const updated = await this.chatService.editMessage(data.messageId, userId, data.content)

      this.server.to(`room:${data.roomId}`).emit("messageEdited", {
        messageId: data.messageId,
        content: data.content,
        editedAt: updated.editedAt,
      })
    } catch (error) {
      client.emit("error", { message: error.message })
    }
  }

  @SubscribeMessage("deleteMessage")
  async handleDeleteMessage(
    @MessageBody() data: { roomId: string; messageId: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const userId = client.data.userId || "unknown"
      await this.chatService.deleteMessage(data.messageId, userId)

      this.server.to(`room:${data.roomId}`).emit("messageDeleted", {
        messageId: data.messageId,
      })
    } catch (error) {
      client.emit("error", { message: error.message })
    }
  }

  // Public method for emitting messages from HTTP controllers (e.g., media uploads)
  async emitNewMessage(roomId: string, message: any) {
    this.server.to(`room:${roomId}`).emit("newMessage", message)
    // Also emit to each participant's user channel so they get unread count
    // updates even when they haven't joined the room
    try {
      const roomUsers = await this.chatService.getRoomUsers(roomId)
      for (const userId of roomUsers) {
        this.server.to(`user:${userId}`).emit("newMessage", message)
      }
    } catch {}
  }

  // Notify all other room participants with an in-app notification
  async notifyRoomParticipants(roomId: string, senderId: string, content: string) {
    try {
      const roomUsers = await this.chatService.getRoomUsers(roomId)
      const otherUsers = roomUsers.filter((userId) => userId !== senderId)

      for (const userId of otherUsers) {
        await this.notificationsService.create({
          userId,
          actorId: senderId,
          type: "message" as any,
          chatRoomId: roomId,
          message: content || "Sent you a message",
        })
      }
    } catch (error) {
      console.error("Failed to notify room participants:", error)
    }
  }
}
