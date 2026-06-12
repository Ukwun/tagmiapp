import { StorageService } from "../config/storage.service";
import type { CreateRoomDto } from "./dto/create-room.dto";
import type { CreateMessageDto } from "./dto/create-message.dto";
import { ChatRoomRepository } from "./repositories/chat-room.repository";
import { ChatMessageRepository } from "./repositories/chat-message.repository";
import { UserRepository } from "../users/repositories/user.repository";
import { BookingRepository } from "../bookings/repositories/booking.repository";
import { ChatRoom } from "./entities/chat-room.entity";
import { ChatMessage } from "./entities/chat-message.entity";
export declare class ChatService {
    private roomRepository;
    private messageRepository;
    private userRepository;
    private bookingRepository;
    private storageService;
    constructor(roomRepository: ChatRoomRepository, messageRepository: ChatMessageRepository, userRepository: UserRepository, bookingRepository: BookingRepository, storageService: StorageService);
    createRoom(userId: string, createRoomDto: CreateRoomDto): Promise<ChatRoom>;
    getUserRooms(userId: string): Promise<ChatRoom[]>;
    joinRoom(roomId: string, userId: string): Promise<ChatRoom>;
    getRoomMessages(roomId: string, userId: string, page?: number, limit?: number): Promise<{
        data: ChatMessage[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    createMessage(roomId: string, senderId: string, createMessageDto: CreateMessageDto): Promise<ChatMessage>;
    sendMessage(roomId: string, senderId: string, content: string, replyToId?: string): Promise<ChatMessage>;
    markMessageAsRead(messageId: string, userId: string): Promise<void>;
    getRoomUsers(roomId: string): Promise<string[]>;
    getOrCreateBookingRoom(bookingId: string, userId: string): Promise<ChatRoom>;
    getOrCreateDirectRoom(userId: string, otherUserId: string): Promise<ChatRoom>;
    editMessage(messageId: string, userId: string, newContent: string): Promise<ChatMessage>;
    deleteMessage(messageId: string, userId: string): Promise<ChatMessage>;
    createMediaMessage(roomId: string, userId: string, file: Express.Multer.File, content?: string): Promise<{
        success: boolean;
        data: ChatMessage;
    }>;
}
