import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LivestreamService } from './livestream.service';
import { WalletService } from '../../wallet/wallet.service';
export declare class LivestreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly livestreamService;
    private readonly walletService;
    server: Server;
    constructor(livestreamService: LivestreamService, walletService: WalletService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleHeartbeat(client: Socket, data: {
        streamId: string;
        userId: string;
    }): Promise<void>;
    handleJoinRoom(client: Socket, room: string): void;
    handlePageUpdate(client: Socket, data: {
        streamId: string;
        userId: string;
        page: number;
    }): Promise<void>;
    handleMessage(client: Socket, data: {
        streamId: string;
        userId: string;
        userName: string;
        text: string;
    }): void;
    handleReaction(client: Socket, data: {
        streamId: string;
        userId: string;
        emoji: string;
    }): void;
    handleTyping(client: Socket, data: {
        streamId: string;
        userId: string;
        userName: string;
        isTyping: boolean;
    }): void;
    handleRaiseHand(client: Socket, data: {
        streamId: string;
        userId: string;
        userName: string;
    }): void;
    handleMuteToggle(client: Socket, data: {
        streamId: string;
        userId: string;
        isMuted: boolean;
    }): void;
    handleGrantScreenShare(client: Socket, data: {
        streamId: string;
        hostId: string;
        participantId: string;
    }): Promise<void>;
    handleRemoteMute(client: Socket, data: {
        streamId: string;
        hostId: string;
        participantId: string;
        mute: boolean;
    }): Promise<void>;
    handleTip(client: Socket, data: {
        streamId: string;
        senderId: string;
        receiverId: string;
        amount: number;
        senderName: string;
    }): Promise<void>;
}
