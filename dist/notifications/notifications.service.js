"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const notification_entity_1 = require("./entities/notification.entity");
const notification_repository_1 = require("./repositories/notification.repository");
const user_repository_1 = require("../users/repositories/user.repository");
let NotificationsService = class NotificationsService {
    constructor(notificationRepository, userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.socketServer = null;
    }
    setSocketServer(server) {
        this.socketServer = server;
    }
    async create(data) {
        if (data.userId === data.actorId) {
            return null;
        }
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const existing = await this.notificationRepository.findOne({
            where: {
                userId: data.userId,
                actorId: data.actorId,
                type: data.type,
                contentId: data.contentId || null,
                commentId: data.commentId || null,
                createdAt: (0, typeorm_1.MoreThan)(fiveMinutesAgo),
            },
        });
        if (existing) {
            return existing;
        }
        const notification = this.notificationRepository.create(data);
        const saved = await this.notificationRepository.save(notification);
        if (this.socketServer) {
            this.socketServer.to(`user:${data.userId}`).emit("newNotification", saved);
        }
        return saved;
    }
    async findAllForUser(userId, limit = 50) {
        return this.notificationRepository.find({
            where: { userId },
            relations: ["actor"],
            order: { createdAt: "DESC" },
            take: limit,
        });
    }
    async getUnreadCount(userId) {
        return this.notificationRepository.count({
            where: { userId, read: false },
        });
    }
    async markAsRead(notificationId, userId) {
        await this.notificationRepository.update({ id: notificationId, userId }, { read: true });
    }
    async markAllAsRead(userId) {
        await this.notificationRepository.update({ userId, read: false }, { read: true });
    }
    async deleteNotification(notificationId, userId) {
        await this.notificationRepository.delete({ id: notificationId, userId });
    }
    async createLikeNotification(contentId, userId, actorId) {
        return this.create({
            userId,
            actorId,
            type: notification_entity_1.NotificationType.LIKE,
            contentId,
        });
    }
    async createCommentNotification(contentId, userId, actorId, commentId) {
        return this.create({
            userId,
            actorId,
            type: notification_entity_1.NotificationType.COMMENT,
            contentId,
            commentId,
        });
    }
    async createFollowNotification(userId, actorId) {
        return this.create({
            userId,
            actorId,
            type: notification_entity_1.NotificationType.FOLLOW,
        });
    }
    async createMessageNotification(chatRoomId, userId, actorId) {
        return this.create({
            userId,
            actorId,
            type: notification_entity_1.NotificationType.MESSAGE,
            chatRoomId,
        });
    }
    async createMentionNotification(userId, actorId, contentId, commentId) {
        return this.create({
            userId,
            actorId,
            type: notification_entity_1.NotificationType.MENTION,
            contentId,
            commentId,
        });
    }
    async createReplyNotification(parentCommentOwnerId, actorId, contentId, commentId) {
        return this.create({
            userId: parentCommentOwnerId,
            actorId,
            type: notification_entity_1.NotificationType.COMMENT_REPLY,
            contentId,
            commentId,
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notification_repository_1.NotificationRepository,
        user_repository_1.UserRepository])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map