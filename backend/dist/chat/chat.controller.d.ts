import { ChatService } from "./chat.service";
import { ChatGateway } from "./chat.gateway";
import { CreateRoomDto } from "./dto/create-room.dto";
import { CreateMessageDto } from "./dto/create-message.dto";
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        role: string;
    };
}
export declare class ChatController {
    private readonly chatService;
    private readonly chatGateway;
    constructor(chatService: ChatService, chatGateway: ChatGateway);
    createRoom(createRoomDto: CreateRoomDto, req: AuthenticatedRequest): Promise<import("./entities/chat-room.entity").ChatRoom>;
    getUserRooms(req: AuthenticatedRequest): Promise<import("./entities/chat-room.entity").ChatRoom[]>;
    getRoomMessages(id: string, page: number, limit: number, req: AuthenticatedRequest): Promise<{
        data: import("./entities/chat-message.entity").ChatMessage[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    createMessage(id: string, createMessageDto: CreateMessageDto, req: AuthenticatedRequest): Promise<import("./entities/chat-message.entity").ChatMessage>;
    getOrCreateBookingRoom(bookingId: string, req: AuthenticatedRequest): Promise<import("./entities/chat-room.entity").ChatRoom>;
    getOrCreateDirectRoom(userId: string, req: AuthenticatedRequest): Promise<import("./entities/chat-room.entity").ChatRoom>;
    editMessage(roomId: string, messageId: string, content: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: import("./entities/chat-message.entity").ChatMessage;
    }>;
    deleteMessage(roomId: string, messageId: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
    }>;
    createMediaMessage(id: string, file: Express.Multer.File, content: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: import("./entities/chat-message.entity").ChatMessage;
    }>;
}
export {};
