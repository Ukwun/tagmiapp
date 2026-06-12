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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const storage_service_1 = require("../config/storage.service");
const chat_room_repository_1 = require("./repositories/chat-room.repository");
const chat_message_repository_1 = require("./repositories/chat-message.repository");
const user_repository_1 = require("../users/repositories/user.repository");
const booking_repository_1 = require("../bookings/repositories/booking.repository");
let ChatService = class ChatService {
    constructor(roomRepository, messageRepository, userRepository, bookingRepository, storageService) {
        this.roomRepository = roomRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.storageService = storageService;
    }
    async createRoom(userId, createRoomDto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        if (createRoomDto.bookingId) {
            const booking = await this.bookingRepository.findOne({
                where: { id: createRoomDto.bookingId },
            });
            if (!booking) {
                throw new common_1.NotFoundException("Booking not found");
            }
            if (booking.clientId !== userId && booking.talentId !== userId) {
                throw new common_1.ForbiddenException("You are not involved in this booking");
            }
        }
        const participantIds = createRoomDto.participants || [];
        if (!participantIds.includes(userId)) {
            participantIds.push(userId);
        }
        const participants = await this.userRepository.findByIds(participantIds);
        if (participants.length === 0) {
            throw new common_1.NotFoundException("No valid participants found");
        }
        const room = this.roomRepository.create({
            name: createRoomDto.name,
            type: createRoomDto.type || "direct",
            bookingId: createRoomDto.bookingId,
            participants,
        });
        return this.roomRepository.save(room);
    }
    async getUserRooms(userId) {
        const allRooms = await this.roomRepository
            .createQueryBuilder("room")
            .innerJoin("room.participants", "participant")
            .leftJoinAndSelect("room.participants", "participants")
            .where("participant.id = :userId", { userId })
            .orderBy("room.updatedAt", "DESC")
            .getMany();
        const rooms = allRooms.filter((room) => {
            if (room.type === "direct" && room.participants.length < 2)
                return false;
            return true;
        });
        for (const room of rooms) {
            const lastMessage = await this.messageRepository
                .createQueryBuilder("message")
                .where("message.roomId = :roomId", { roomId: room.id })
                .leftJoinAndSelect("message.sender", "sender")
                .orderBy("message.createdAt", "DESC")
                .limit(1)
                .getOne();
            const unreadCount = await this.messageRepository.count({
                where: {
                    roomId: room.id,
                    senderId: (0, typeorm_1.Not)(userId),
                    isRead: false,
                    isDeleted: false,
                },
            });
            room.lastMessage = lastMessage;
            room.unreadCount = unreadCount;
        }
        return rooms;
    }
    async joinRoom(roomId, userId) {
        const room = await this.roomRepository.findOne({
            where: { id: roomId },
            relations: ["participants"],
        });
        if (!room) {
            throw new common_1.NotFoundException("Room not found");
        }
        const isParticipant = room.participants.some((p) => p.id === userId);
        if (!isParticipant) {
            if (room.bookingId) {
                const booking = await this.bookingRepository.findOne({
                    where: { id: room.bookingId },
                });
                if (!booking || (booking.clientId !== userId && booking.talentId !== userId)) {
                    throw new common_1.ForbiddenException("You cannot join this room");
                }
            }
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (user) {
                room.participants.push(user);
                await this.roomRepository.save(room);
            }
        }
        return room;
    }
    async getRoomMessages(roomId, userId, page = 1, limit = 50) {
        const room = await this.roomRepository.findOne({
            where: { id: roomId },
        });
        if (!room) {
            throw new common_1.NotFoundException("Room not found");
        }
        const roomWithParticipants = await this.roomRepository.findOne({
            where: { id: roomId },
            relations: ["participants"],
        });
        const hasAccess = roomWithParticipants?.participants.some((p) => p.id === userId);
        if (!hasAccess) {
            throw new common_1.ForbiddenException("You don't have access to this room");
        }
        const [messages, total] = await this.messageRepository.findAndCount({
            where: { roomId },
            relations: ["sender", "replyTo", "replyTo.sender"],
            order: { createdAt: "DESC" },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            data: messages.reverse(),
            total,
            page,
            limit,
            hasNext: page * limit < total,
            hasPrev: page > 1,
        };
    }
    async createMessage(roomId, senderId, createMessageDto) {
        const room = await this.roomRepository.findOne({
            where: { id: roomId },
            relations: ["participants"],
        });
        if (!room) {
            throw new common_1.NotFoundException("Room not found");
        }
        const hasAccess = room.participants.some((p) => p.id === senderId);
        if (!hasAccess) {
            throw new common_1.ForbiddenException("You don't have access to this room");
        }
        const message = this.messageRepository.create({
            roomId,
            senderId,
            content: createMessageDto.content,
            replyToId: createMessageDto.replyToId || null,
        });
        const savedMessage = await this.messageRepository.save(message);
        room.updatedAt = new Date();
        await this.roomRepository.save(room);
        return this.messageRepository.findOne({
            where: { id: savedMessage.id },
            relations: ["sender", "replyTo", "replyTo.sender"],
        });
    }
    async sendMessage(roomId, senderId, content, replyToId) {
        return this.createMessage(roomId, senderId, { content, replyToId });
    }
    async markMessageAsRead(messageId, userId) {
        const message = await this.messageRepository.findOne({
            where: { id: messageId },
        });
        if (!message) {
            throw new common_1.NotFoundException("Message not found");
        }
        const room = await this.roomRepository.findOne({
            where: { id: message.roomId },
            relations: ["participants"],
        });
        if (!room) {
            throw new common_1.NotFoundException("Room not found");
        }
        const hasAccess = room.participants.some((p) => p.id === userId);
        if (!hasAccess) {
            throw new common_1.ForbiddenException("You don't have access to this message");
        }
        if (!message.isRead) {
            message.isRead = true;
            await this.messageRepository.save(message);
        }
    }
    async getRoomUsers(roomId) {
        const room = await this.roomRepository.findOne({
            where: { id: roomId },
            relations: ["participants"],
        });
        return room?.participants.map((p) => p.id) || [];
    }
    async getOrCreateBookingRoom(bookingId, userId) {
        let room = await this.roomRepository.findOne({
            where: { bookingId },
        });
        if (room) {
            return room;
        }
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
            relations: ["client", "talent"],
        });
        if (!booking) {
            throw new common_1.NotFoundException("Booking not found");
        }
        if (booking.clientId !== userId && booking.talentId !== userId) {
            throw new common_1.ForbiddenException("You are not involved in this booking");
        }
        room = this.roomRepository.create({
            name: `Booking: ${booking.title}`,
            type: "booking",
            bookingId,
            participants: [booking.client, booking.talent],
        });
        return this.roomRepository.save(room);
    }
    async getOrCreateDirectRoom(userId, otherUserId) {
        if (userId === otherUserId) {
            throw new common_1.BadRequestException("Cannot create a chat room with yourself");
        }
        const rooms = await this.roomRepository
            .createQueryBuilder("room")
            .innerJoin("room.participants", "p1")
            .innerJoin("room.participants", "p2")
            .leftJoinAndSelect("room.participants", "participant")
            .where("room.type = :type", { type: "direct" })
            .andWhere("p1.id = :userId", { userId })
            .andWhere("p2.id = :otherUserId", { otherUserId })
            .getMany();
        const existingRoom = rooms.find(room => room.participants.length === 2);
        if (existingRoom) {
            return existingRoom;
        }
        const [user, otherUser] = await Promise.all([
            this.userRepository.findOne({ where: { id: userId } }),
            this.userRepository.findOne({ where: { id: otherUserId } }),
        ]);
        if (!user || !otherUser) {
            throw new common_1.NotFoundException("User not found");
        }
        const room = this.roomRepository.create({
            name: `${user.displayName} & ${otherUser.displayName}`,
            type: "direct",
            participants: [user, otherUser],
        });
        return this.roomRepository.save(room);
    }
    async editMessage(messageId, userId, newContent) {
        const message = await this.messageRepository.findOne({
            where: { id: messageId },
            relations: ["sender"],
        });
        if (!message) {
            throw new common_1.NotFoundException("Message not found");
        }
        if (message.senderId !== userId) {
            throw new common_1.ForbiddenException("You can only edit your own messages");
        }
        if (message.isDeleted) {
            throw new common_1.BadRequestException("Cannot edit a deleted message");
        }
        message.content = newContent;
        message.isEdited = true;
        message.editedAt = new Date();
        return this.messageRepository.save(message);
    }
    async deleteMessage(messageId, userId) {
        const message = await this.messageRepository.findOne({
            where: { id: messageId },
            relations: ["sender"],
        });
        if (!message) {
            throw new common_1.NotFoundException("Message not found");
        }
        if (message.senderId !== userId) {
            throw new common_1.ForbiddenException("You can only delete your own messages");
        }
        message.isDeleted = true;
        message.deletedAt = new Date();
        message.content = "";
        message.mediaUrl = null;
        message.mediaType = null;
        message.fileName = null;
        return this.messageRepository.save(message);
    }
    async createMediaMessage(roomId, userId, file, content) {
        const room = await this.roomRepository.findOne({
            where: { id: roomId },
            relations: ["participants"],
        });
        if (!room) {
            throw new common_1.NotFoundException("Room not found");
        }
        const isParticipant = room.participants.some((p) => p.id === userId);
        if (!isParticipant) {
            throw new common_1.ForbiddenException("You are not a participant in this room");
        }
        let mediaType;
        if (file.mimetype.startsWith("image/")) {
            mediaType = "image";
        }
        else if (file.mimetype.startsWith("video/")) {
            mediaType = "video";
        }
        else if (file.mimetype.startsWith("audio/")) {
            mediaType = "audio";
        }
        else if (file.mimetype === "application/pdf" ||
            file.mimetype === "application/msword" ||
            file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            file.mimetype === "application/vnd.ms-excel" ||
            file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            file.mimetype === "text/plain" ||
            file.mimetype === "text/csv") {
            mediaType = "document";
        }
        else {
            throw new common_1.ForbiddenException("Unsupported file type");
        }
        const uploadResult = mediaType === "video"
            ? await this.storageService.uploadVideo(file)
            : mediaType === "image"
                ? await this.storageService.uploadImage(file)
                : await this.storageService.uploadFile(file);
        const message = this.messageRepository.create({
            roomId,
            senderId: userId,
            content: content || "",
            mediaUrl: uploadResult.secure_url,
            mediaType,
            fileName: file.originalname || null,
        });
        const savedMessage = await this.messageRepository.save(message);
        const messageWithSender = await this.messageRepository.findOne({
            where: { id: savedMessage.id },
            relations: ["sender"],
        });
        return { success: true, data: messageWithSender };
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [chat_room_repository_1.ChatRoomRepository,
        chat_message_repository_1.ChatMessageRepository,
        user_repository_1.UserRepository,
        booking_repository_1.BookingRepository,
        storage_service_1.StorageService])
], ChatService);
//# sourceMappingURL=chat.service.js.map