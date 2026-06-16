import { Injectable } from "@nestjs/common"
import { MoreThan } from "typeorm"
import { Notification, NotificationType } from "./entities/notification.entity"
import type { Server } from "socket.io"
import { NotificationRepository } from "./repositories/notification.repository"
import { UserRepository } from "../users/repositories/user.repository"

@Injectable()
export class NotificationsService {
  private socketServer: Server | null = null

  constructor(
    private notificationRepository: NotificationRepository,
    private userRepository: UserRepository,
  ) {}

  // Called by ChatGateway to register the socket server
  setSocketServer(server: Server) {
    this.socketServer = server
  }

  async create(data: {
    userId: string
    actorId: string
    type: NotificationType
    contentId?: string
    commentId?: string
    chatRoomId?: string
    message?: string
  }): Promise<Notification> {
    // Don't create notification if user is notifying themselves
    if (data.userId === data.actorId) {
      return null
    }

    // Check for duplicate recent notifications (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const existing = await this.notificationRepository.findOne({
      where: {
        userId: data.userId,
        actorId: data.actorId,
        type: data.type,
        contentId: data.contentId || null,
        commentId: data.commentId || null,
        createdAt: MoreThan(fiveMinutesAgo),
      },
    })

    if (existing) {
      return existing
    }

    const notification = this.notificationRepository.create(data)
    const saved = await this.notificationRepository.save(notification)

    // Push real-time notification via WebSocket
    if (this.socketServer) {
      this.socketServer.to(`user:${data.userId}`).emit("newNotification", saved)
    }

    return saved
  }

  async findAllForUser(userId: string, limit = 50): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      relations: ["actor"],
      order: { createdAt: "DESC" },
      take: limit,
    })
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, read: false },
    })
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepository.update(
      { id: notificationId, userId },
      { read: true },
    )
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update({ userId, read: false }, { read: true })
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepository.delete({ id: notificationId, userId })
  }

  // Helper methods to create specific notification types
  async createLikeNotification(contentId: string, userId: string, actorId: string) {
    return this.create({
      userId,
      actorId,
      type: NotificationType.LIKE,
      contentId,
    })
  }

  async createCommentNotification(
    contentId: string,
    userId: string,
    actorId: string,
    commentId: string,
  ) {
    return this.create({
      userId,
      actorId,
      type: NotificationType.COMMENT,
      contentId,
      commentId,
    })
  }

  async createFollowNotification(userId: string, actorId: string) {
    return this.create({
      userId,
      actorId,
      type: NotificationType.FOLLOW,
    })
  }

  async createMessageNotification(chatRoomId: string, userId: string, actorId: string) {
    return this.create({
      userId,
      actorId,
      type: NotificationType.MESSAGE,
      chatRoomId,
    })
  }

  async createMentionNotification(
    userId: string,
    actorId: string,
    contentId?: string,
    commentId?: string,
  ) {
    return this.create({
      userId,
      actorId,
      type: NotificationType.MENTION,
      contentId,
      commentId,
    })
  }

  async createReplyNotification(
    parentCommentOwnerId: string,
    actorId: string,
    contentId: string,
    commentId: string,
  ) {
    return this.create({
      userId: parentCommentOwnerId,
      actorId,
      type: NotificationType.COMMENT_REPLY,
      contentId,
      commentId,
    })
  }
}
