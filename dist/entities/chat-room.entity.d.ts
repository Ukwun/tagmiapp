import { User } from "./user.entity";
import { ChatMessage } from "./chat-message.entity";
export declare class ChatRoom {
    id: string;
    name: string;
    type: "direct" | "group" | "booking";
    bookingId: string | null;
    createdAt: Date;
    updatedAt: Date;
    participants: User[];
    messages: ChatMessage[];
}
