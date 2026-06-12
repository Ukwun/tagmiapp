import { User } from "./user.entity";
import { ChatRoom } from "./chat-room.entity";
export declare class ChatMessage {
    id: string;
    roomId: string;
    senderId: string;
    content: string;
    isRead: boolean;
    createdAt: Date;
    room: ChatRoom;
    sender: User;
}
