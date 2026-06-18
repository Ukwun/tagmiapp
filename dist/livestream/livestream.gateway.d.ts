import 'reflect-metadata';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class LivestreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private roomUsers;
    private userRooms;
    private pendingJoinRequests;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(client: Socket, payload: {
        roomId: string;
        role?: string;
        username?: string;
    }): void;
    handleSendMessage(client: Socket, data: {
        roomId: string;
        user: string;
        content: string;
    }): void;
    handleReaction(client: Socket, data: {
        roomId: string;
        emoji: string;
        username?: string;
    }): void;
    handleWatcher(client: Socket, data: {
        roomId: string;
        viewerId: string;
    }): void;
    handleLeaveRoom(client: Socket, data: {
        roomId: string;
    }): void;
    handleOffer(client: Socket, data: {
        roomId: string;
        offer: any;
        from: string;
        to: string;
    }): void;
    handleRequestToJoin(client: Socket, data: {
        roomId: string;
        username?: string;
    }): void;
    handleApproveJoin(client: Socket, data: {
        roomId: string;
        requesterId: string;
        username?: string;
    }): void;
    handleDeclineJoin(client: Socket, data: {
        roomId: string;
        requesterId: string;
        username?: string;
        reason?: string;
    }): void;
    handleAnswer(client: Socket, data: {
        roomId: string;
        answer: any;
        from: string;
        to: string;
    }): void;
    handleIceCandidate(client: Socket, data: {
        roomId: string;
        candidate: any;
        from: string;
        to: string;
    }): void;
}
