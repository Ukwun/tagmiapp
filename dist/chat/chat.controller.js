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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const chat_service_1 = require("./chat.service");
const chat_gateway_1 = require("./chat.gateway");
const create_room_dto_1 = require("./dto/create-room.dto");
const create_message_dto_1 = require("./dto/create-message.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ChatController = class ChatController {
    constructor(chatService, chatGateway) {
        this.chatService = chatService;
        this.chatGateway = chatGateway;
    }
    async createRoom(createRoomDto, req) {
        return this.chatService.createRoom(req.user.id, createRoomDto);
    }
    async getUserRooms(req) {
        return this.chatService.getUserRooms(req.user.id);
    }
    async getRoomMessages(id, page, limit, req) {
        return this.chatService.getRoomMessages(id, req.user.id, page, limit);
    }
    async createMessage(id, createMessageDto, req) {
        return this.chatService.createMessage(id, req.user.id, createMessageDto);
    }
    async getOrCreateBookingRoom(bookingId, req) {
        return this.chatService.getOrCreateBookingRoom(bookingId, req.user.id);
    }
    async getOrCreateDirectRoom(userId, req) {
        return this.chatService.getOrCreateDirectRoom(req.user.id, userId);
    }
    async editMessage(roomId, messageId, content, req) {
        const updated = await this.chatService.editMessage(messageId, req.user.id, content);
        this.chatGateway.server.to(`room:${roomId}`).emit("messageEdited", {
            messageId,
            content,
            editedAt: updated.editedAt,
        });
        return { success: true, data: updated };
    }
    async deleteMessage(roomId, messageId, req) {
        await this.chatService.deleteMessage(messageId, req.user.id);
        this.chatGateway.server.to(`room:${roomId}`).emit("messageDeleted", { messageId });
        return { success: true };
    }
    async createMediaMessage(id, file, content, req) {
        const result = await this.chatService.createMediaMessage(id, req.user.id, file, content);
        if (result.success && result.data) {
            this.chatGateway.emitNewMessage(id, result.data);
            const mediaLabel = file.mimetype.startsWith("audio/") ? "Sent a voice message" : "Sent a file";
            this.chatGateway.notifyRoomParticipants(id, req.user.id, mediaLabel);
        }
        return result;
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Post)("rooms"),
    (0, swagger_1.ApiOperation)({ summary: "Create a new chat room" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Room created successfully" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_room_dto_1.CreateRoomDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createRoom", null);
__decorate([
    (0, common_1.Get)("rooms"),
    (0, swagger_1.ApiOperation)({ summary: "Get user's chat rooms" }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getUserRooms", null);
__decorate([
    (0, common_1.Get)("rooms/:id/messages"),
    (0, swagger_1.ApiOperation)({ summary: "Get room messages" }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("page")),
    __param(2, (0, common_1.Query)("limit")),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getRoomMessages", null);
__decorate([
    (0, common_1.Post)("rooms/:id/messages"),
    (0, swagger_1.ApiOperation)({ summary: "Send a message to a room" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Message sent successfully" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_message_dto_1.CreateMessageDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createMessage", null);
__decorate([
    (0, common_1.Post)("bookings/:bookingId/room"),
    (0, swagger_1.ApiOperation)({ summary: "Get or create chat room for booking" }),
    __param(0, (0, common_1.Param)("bookingId")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getOrCreateBookingRoom", null);
__decorate([
    (0, common_1.Post)("direct/:userId"),
    (0, swagger_1.ApiOperation)({ summary: "Get or create direct chat room with a user" }),
    __param(0, (0, common_1.Param)("userId")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getOrCreateDirectRoom", null);
__decorate([
    (0, common_1.Patch)("rooms/:roomId/messages/:messageId"),
    (0, swagger_1.ApiOperation)({ summary: "Edit a message" }),
    __param(0, (0, common_1.Param)("roomId")),
    __param(1, (0, common_1.Param)("messageId")),
    __param(2, (0, common_1.Body)("content")),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "editMessage", null);
__decorate([
    (0, common_1.Delete)("rooms/:roomId/messages/:messageId"),
    (0, swagger_1.ApiOperation)({ summary: "Delete a message" }),
    __param(0, (0, common_1.Param)("roomId")),
    __param(1, (0, common_1.Param)("messageId")),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "deleteMessage", null);
__decorate([
    (0, common_1.Post)("rooms/:id/messages/media"),
    (0, swagger_1.ApiOperation)({ summary: "Send a media message to a room" }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)("content")),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createMediaMessage", null);
exports.ChatController = ChatController = __decorate([
    (0, swagger_1.ApiTags)("Chat"),
    (0, common_1.Controller)("chat"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => chat_gateway_1.ChatGateway))),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        chat_gateway_1.ChatGateway])
], ChatController);
//# sourceMappingURL=chat.controller.js.map