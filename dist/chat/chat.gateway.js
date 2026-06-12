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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const chat_service_1 = require("./chat.service");
const notifications_service_1 = require("../notifications/notifications.service");
let ChatGateway = class ChatGateway {
    constructor(chatService, jwtService, notificationsService) {
        this.chatService = chatService;
        this.jwtService = jwtService;
        this.notificationsService = notificationsService;
        this.userSockets = new Map();
    }
    afterInit(server) {
        this.notificationsService.setSocketServer(server);
    }
    async handleConnection(client) {
        try {
            const userId = await this.validateConnection(client);
            if (userId) {
                client.data.userId = userId;
                this.userSockets.set(userId, client.id);
                client.join(`user:${userId}`);
                console.log(`User ${userId} connected with socket ${client.id}`);
            }
            else {
                console.log("Connection rejected: Invalid authentication");
                client.disconnect();
            }
        }
        catch (error) {
            console.error("Connection error:", error);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        for (const [userId, socketId] of this.userSockets.entries()) {
            if (socketId === client.id) {
                this.userSockets.delete(userId);
                console.log(`User ${userId} disconnected`);
                break;
            }
        }
    }
    async validateConnection(client) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(" ")[1];
            if (!token) {
                throw new Error("No token provided");
            }
            const userId = await this.extractUserIdFromToken(token);
            return userId;
        }
        catch (error) {
            console.error("Token validation failed:", error);
            return null;
        }
    }
    async extractUserIdFromToken(token) {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET || "your-secret-key",
            });
            return payload.sub || payload.id;
        }
        catch (error) {
            throw new Error("Invalid token");
        }
    }
    handleJoinRoom(roomId, client) {
        try {
            const userId = client.data.userId || "unknown";
            client.join(`room:${roomId}`);
            client.emit("joinedRoom", { roomId });
            client.to(`room:${roomId}`).emit("userJoined", { userId, roomId });
        }
        catch (error) {
            client.emit("error", { message: error.message });
        }
    }
    handleLeaveRoom(roomId, client) {
        try {
            const userId = client.data.userId || "unknown";
            client.leave(`room:${roomId}`);
            client.emit("leftRoom", { roomId });
            client.to(`room:${roomId}`).emit("userLeft", { userId, roomId });
        }
        catch (error) {
            client.emit("error", { message: error.message });
        }
    }
    async handleMessage(data, client) {
        try {
            const userId = client.data.userId || "unknown";
            const savedMessage = await this.chatService.sendMessage(data.roomId, userId, data.content, data.replyToId);
            this.server.to(`room:${data.roomId}`).emit("newMessage", savedMessage);
            try {
                const roomUsers = await this.chatService.getRoomUsers(data.roomId);
                for (const uid of roomUsers) {
                    if (uid !== userId) {
                        this.server.to(`user:${uid}`).emit("newMessage", savedMessage);
                    }
                }
            }
            catch { }
            this.notifyRoomParticipants(data.roomId, userId, data.content);
        }
        catch (error) {
            console.error("Error sending message:", error);
            client.emit("error", { message: error.message });
        }
    }
    async handleMarkAsRead(data, client) {
        try {
            const userId = client.data.userId || "unknown";
            await this.chatService.markMessageAsRead(data.messageId, userId);
            this.server.to(`room:${data.roomId}`).emit("messageRead", {
                messageId: data.messageId,
                readBy: userId,
            });
        }
        catch (error) {
            client.emit("error", { message: error.message });
        }
    }
    handleTyping(data, client) {
        try {
            const userId = client.data.userId || "unknown";
            client.to(`room:${data.roomId}`).emit("userTyping", {
                userId,
                isTyping: data.isTyping,
            });
        }
        catch (error) {
            client.emit("error", { message: error.message });
        }
    }
    async handleEditMessage(data, client) {
        try {
            const userId = client.data.userId || "unknown";
            const updated = await this.chatService.editMessage(data.messageId, userId, data.content);
            this.server.to(`room:${data.roomId}`).emit("messageEdited", {
                messageId: data.messageId,
                content: data.content,
                editedAt: updated.editedAt,
            });
        }
        catch (error) {
            client.emit("error", { message: error.message });
        }
    }
    async handleDeleteMessage(data, client) {
        try {
            const userId = client.data.userId || "unknown";
            await this.chatService.deleteMessage(data.messageId, userId);
            this.server.to(`room:${data.roomId}`).emit("messageDeleted", {
                messageId: data.messageId,
            });
        }
        catch (error) {
            client.emit("error", { message: error.message });
        }
    }
    async emitNewMessage(roomId, message) {
        this.server.to(`room:${roomId}`).emit("newMessage", message);
        try {
            const roomUsers = await this.chatService.getRoomUsers(roomId);
            for (const userId of roomUsers) {
                this.server.to(`user:${userId}`).emit("newMessage", message);
            }
        }
        catch { }
    }
    async notifyRoomParticipants(roomId, senderId, content) {
        try {
            const roomUsers = await this.chatService.getRoomUsers(roomId);
            const otherUsers = roomUsers.filter((userId) => userId !== senderId);
            for (const userId of otherUsers) {
                await this.notificationsService.create({
                    userId,
                    actorId: senderId,
                    type: "message",
                    chatRoomId: roomId,
                    message: content || "Sent you a message",
                });
            }
        }
        catch (error) {
            console.error("Failed to notify room participants:", error);
        }
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", Function)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("joinRoom"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Function]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("leaveRoom"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Function]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("sendMessage"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("markAsRead"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMarkAsRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("typing"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("editMessage"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleEditMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("deleteMessage"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleDeleteMessage", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.CORS_ORIGIN?.split(",") || [
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:3002",
            ],
            credentials: true,
        },
    }),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => notifications_service_1.NotificationsService))),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        jwt_1.JwtService,
        notifications_service_1.NotificationsService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map