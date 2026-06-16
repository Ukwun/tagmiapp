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
exports.LivestreamGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const livestream_service_1 = require("./livestream.service");
const wallet_service_1 = require("../../wallet/wallet.service");
let LivestreamGateway = class LivestreamGateway {
    constructor(livestreamService, walletService) {
        this.livestreamService = livestreamService;
        this.walletService = walletService;
    }
    handleConnection(client) {
        console.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
    }
    async handleHeartbeat(client, data) {
        await this.livestreamService.updateHeartbeat(data.streamId, data.userId);
    }
    handleJoinRoom(client, room) {
        client.join(room);
    }
    async handlePageUpdate(client, data) {
        if (typeof data.page !== 'number' || data.page < 1) {
            client.emit('error', { message: 'Invalid page number' });
            return;
        }
        try {
            const updatedStream = await this.livestreamService.updatePdfPage(data.streamId, data.userId, data.page);
            this.server.to(data.streamId).emit('onPageChanged', {
                page: updatedStream.currentPdfPage,
                updatedBy: data.userId
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            client.emit('error', { message: errorMessage });
        }
    }
    handleMessage(client, data) {
        this.server.to(data.streamId).emit('onMessage', {
            ...data,
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            timestamp: new Date().toISOString(),
        });
    }
    handleReaction(client, data) {
        this.server.to(data.streamId).emit('onReaction', {
            emoji: data.emoji,
            userId: data.userId,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            animationType: Math.random() > 0.5 ? 'float' : 'burst',
            intensity: Math.floor(Math.random() * 3) + 1,
        });
    }
    handleTyping(client, data) {
        client.to(data.streamId).emit('onTyping', {
            userId: data.userId,
            userName: data.userName,
            isTyping: data.isTyping
        });
    }
    handleRaiseHand(client, data) {
        this.server.to(data.streamId).emit('onHandRaised', {
            userId: data.userId,
            userName: data.userName,
            timestamp: new Date().toISOString(),
            hapticPattern: 'heavy',
            animation: 'wave'
        });
    }
    handleMuteToggle(client, data) {
        this.server.to(data.streamId).emit('onMuteStatusChanged', {
            userId: data.userId,
            isMuted: data.isMuted,
            haptic: 'selection',
            animation: 'pop_toggle'
        });
    }
    async handleGrantScreenShare(client, data) {
        const isHost = await this.livestreamService.isHost(data.streamId, data.hostId);
        if (isHost) {
            this.server.to(data.streamId).emit('onScreenShareGranted', {
                participantId: data.participantId,
                grantedBy: data.hostId,
                haptic: 'success',
                animation: 'screen_sparkle'
            });
        }
    }
    async handleRemoteMute(client, data) {
        const isHost = await this.livestreamService.isHost(data.streamId, data.hostId);
        if (isHost) {
            this.server.to(data.streamId).emit('onRemoteMuteStatusChanged', {
                participantId: data.participantId,
                isMuted: data.mute,
                mutedBy: data.hostId
            });
        }
    }
    async handleTip(client, data) {
        try {
            await this.walletService.holdPayment(data.senderId, data.receiverId, data.amount);
            this.server.to(data.streamId).emit('onTipReceived', {
                senderName: data.senderName,
                amount: data.amount,
                animation: 'coins_rain',
                haptic: 'success'
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            client.emit('error', { message: errorMessage });
        }
    }
};
exports.LivestreamGateway = LivestreamGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], LivestreamGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('heartbeat'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], LivestreamGateway.prototype, "handleHeartbeat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], LivestreamGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('pageUpdate'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], LivestreamGateway.prototype, "handlePageUpdate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], LivestreamGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendReaction'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], LivestreamGateway.prototype, "handleReaction", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], LivestreamGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('raiseHand'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], LivestreamGateway.prototype, "handleRaiseHand", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('toggleMute'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], LivestreamGateway.prototype, "handleMuteToggle", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('grantScreenShare'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], LivestreamGateway.prototype, "handleGrantScreenShare", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('remoteMute'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], LivestreamGateway.prototype, "handleRemoteMute", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendTip'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], LivestreamGateway.prototype, "handleTip", null);
exports.LivestreamGateway = LivestreamGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' }, namespace: 'livestream' }),
    __metadata("design:paramtypes", [livestream_service_1.LivestreamService,
        wallet_service_1.WalletService])
], LivestreamGateway);
//# sourceMappingURL=livestream.gateway.js.map