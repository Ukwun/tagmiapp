import { Notification, NotificationType } from "./entities/notification.entity";
import type { Server } from "socket.io";
import { NotificationRepository } from "./repositories/notification.repository";
import { UserRepository } from "../users/repositories/user.repository";
export declare class NotificationsService {
    private notificationRepository;
    private userRepository;
    private socketServer;
    constructor(notificationRepository: NotificationRepository, userRepository: UserRepository);
    setSocketServer(server: Server): void;
    create(data: {
        userId: string;
        actorId: string;
        type: NotificationType;
        contentId?: string;
        commentId?: string;
        chatRoomId?: string;
        message?: string;
    }): Promise<Notification>;
    findAllForUser(userId: string, limit?: number): Promise<Notification[]>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    deleteNotification(notificationId: string, userId: string): Promise<void>;
    createLikeNotification(contentId: string, userId: string, actorId: string): Promise<Notification>;
    createCommentNotification(contentId: string, userId: string, actorId: string, commentId: string): Promise<Notification>;
    createFollowNotification(userId: string, actorId: string): Promise<Notification>;
    createMessageNotification(chatRoomId: string, userId: string, actorId: string): Promise<Notification>;
    createMentionNotification(userId: string, actorId: string, contentId?: string, commentId?: string): Promise<Notification>;
    createReplyNotification(parentCommentOwnerId: string, actorId: string, contentId: string, commentId: string): Promise<Notification>;
}
