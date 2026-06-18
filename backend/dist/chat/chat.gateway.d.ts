import { type OnGatewayConnection, type OnGatewayDisconnect, type OnGatewayInit } from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { ChatService } from "./chat.service";
import { NotificationsService } from "../notifications/notifications.service";
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private chatService;
    private jwtService;
    private notificationsService;
    server: Server;
    private userSockets;
    constructor(chatService: ChatService, jwtService: JwtService, notificationsService: NotificationsService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    private validateConnection;
    private extractUserIdFromToken;
    handleJoinRoom(roomId: string, client: Socket): void;
    handleLeaveRoom(roomId: string, client: Socket): void;
    handleMessage(data: {
        roomId: string;
        content: string;
        replyToId?: string;
    }, client: Socket): Promise<void>;
    handleMarkAsRead(data: {
        roomId: string;
        messageId: string;
    }, client: Socket): Promise<void>;
    handleTyping(data: {
        roomId: string;
        isTyping: boolean;
    }, client: Socket): void;
    handleReaction(data: {
        roomId: string;
        emoji: string;
    }, client: Socket): void;
    handleEditMessage(data: {
        roomId: string;
        messageId: string;
        content: string;
    }, client: Socket): Promise<void>;
    handleDeleteMessage(data: {
        roomId: string;
        messageId: string;
    }, client: Socket): Promise<void>;
    emitNewMessage(roomId: string, message: any): Promise<void>;
    notifyRoomParticipants(roomId: string, senderId: string, content: string): Promise<void>;
}
