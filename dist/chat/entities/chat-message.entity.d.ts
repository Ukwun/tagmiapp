import { User } from "../../users/entities/user.entity";
import { ChatRoom } from "./chat-room.entity";
export declare class ChatMessage {
    id: string;
    roomId: string;
    senderId: string;
    content: string;
    mediaUrl: string;
    mediaType: string;
    fileName: string;
    isRead: boolean;
    replyToId: string;
    isEdited: boolean;
    editedAt: Date | null;
    isDeleted: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    room: ChatRoom;
    sender: User;
    replyTo: ChatMessage;
}
