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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LivestreamGateway = void 0;
require("reflect-metadata");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let LivestreamGateway = class LivestreamGateway {
    constructor() {
        this.roomUsers = new Map();
        this.userRooms = new Map();
        this.pendingJoinRequests = new Map();
    }
    handleConnection(client) {
        console.log(`[Socket] Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`[Socket] Client disconnected: ${client.id}`);
        const roomId = this.userRooms.get(client.id);
        if (roomId) {
            const users = this.roomUsers.get(roomId) || [];
            const filtered = users.filter(u => u.socketId !== client.id);
            if (filtered.length > 0) {
                this.roomUsers.set(roomId, filtered);
            }
            else {
                this.roomUsers.delete(roomId);
            }
            const pending = this.pendingJoinRequests.get(roomId) || [];
            const pendingFiltered = pending.filter((req) => req.socketId !== client.id);
            if (pendingFiltered.length > 0) {
                this.pendingJoinRequests.set(roomId, pendingFiltered);
            }
            else {
                this.pendingJoinRequests.delete(roomId);
            }
            this.userRooms.delete(client.id);
            this.server.to(roomId).emit('userLeft', {
                socketId: client.id,
                timestamp: Date.now(),
            });
        }
    }
    handleJoinRoom(client, payload) {
        const { roomId, role = 'viewer', username = 'Anonymous' } = payload;
        client.join(roomId);
        this.userRooms.set(client.id, roomId);
        const roomUsers = this.roomUsers.get(roomId) || [];
        roomUsers.push({
            socketId: client.id,
            username,
            role: role,
            timestamp: Date.now(),
        });
        this.roomUsers.set(roomId, roomUsers);
        console.log(`[Socket] ${username} joined room ${roomId} as ${role}`);
        this.server.to(roomId).emit('peerJoined', {
            socketId: client.id,
            role,
            username,
            roomUsers: roomUsers.length,
            timestamp: Date.now(),
        });
    }
    handleSendMessage(client, data) {
        if (!data.roomId || !data.content) {
            console.warn('[Socket] Invalid message data');
            return;
        }
        console.log(`[Socket] Message in ${data.roomId}: ${data.user} - ${data.content}`);
        this.server.to(data.roomId).emit('newMessage', {
            user: data.user,
            content: data.content,
            socketId: client.id,
            timestamp: Date.now(),
        });
    }
    handleReaction(client, data) {
        if (!data.roomId || !data.emoji) {
            console.warn('[Socket] Invalid reaction data');
            return;
        }
        console.log(`[Socket] Reaction in ${data.roomId}: ${data.emoji} from ${client.id}`);
        this.server.to(data.roomId).emit('onReaction', {
            emoji: data.emoji,
            socketId: client.id,
            username: data.username || 'User',
            timestamp: Date.now(),
        });
    }
    handleWatcher(client, data) {
        const roomId = data.roomId;
        const roomUsers = this.roomUsers.get(roomId) || [];
        console.log(`[Socket] Watcher update for ${roomId}: ${roomUsers.length} users`);
        this.server.to(roomId).emit('watcher', {
            viewerId: data.viewerId,
            count: roomUsers.length,
            timestamp: Date.now(),
        });
    }
    handleLeaveRoom(client, data) {
        const roomId = data.roomId;
        client.leave(roomId);
        const roomUsers = this.roomUsers.get(roomId) || [];
        const filtered = roomUsers.filter(u => u.socketId !== client.id);
        if (filtered.length > 0) {
            this.roomUsers.set(roomId, filtered);
        }
        else {
            this.roomUsers.delete(roomId);
        }
        this.userRooms.delete(client.id);
        const pending = this.pendingJoinRequests.get(roomId) || [];
        const pendingFiltered = pending.filter((req) => req.socketId !== client.id);
        if (pendingFiltered.length > 0) {
            this.pendingJoinRequests.set(roomId, pendingFiltered);
        }
        else {
            this.pendingJoinRequests.delete(roomId);
        }
        console.log(`[Socket] User left room ${roomId}`);
        this.server.to(roomId).emit('userLeft', {
            socketId: client.id,
            roomUsers: filtered.length,
            timestamp: Date.now(),
        });
    }
    handleOffer(client, data) {
        this.server.to(data.to).emit('offer', data);
    }
    handleRequestToJoin(client, data) {
        const { roomId, username = 'Guest' } = data;
        const roomUsers = this.roomUsers.get(roomId) || [];
        const hosts = roomUsers.filter((user) => user.role === 'host');
        const request = {
            socketId: client.id,
            username,
            timestamp: Date.now(),
        };
        const existing = this.pendingJoinRequests.get(roomId) || [];
        if (existing.some((req) => req.socketId === client.id)) {
            client.emit('joinRequestFailed', {
                roomId,
                reason: 'You already have a pending join request.',
            });
            return;
        }
        this.pendingJoinRequests.set(roomId, [...existing, request]);
        if (hosts.length === 0) {
            client.emit('joinRequestFailed', {
                roomId,
                reason: 'Host not available',
            });
            return;
        }
        hosts.forEach((host) => {
            this.server.to(host.socketId).emit('joinRequest', request);
        });
        console.log(`[Socket] Join request from ${username} in room ${roomId}`);
    }
    handleApproveJoin(client, data) {
        const { roomId, requesterId, username = 'Guest' } = data;
        const roomUsers = this.roomUsers.get(roomId) || [];
        const host = roomUsers.find((user) => user.socketId === client.id && user.role === 'host');
        if (!host) {
            console.warn(`[Socket] Unauthorized approveJoin from ${client.id}`);
            return;
        }
        const pending = this.pendingJoinRequests.get(roomId) || [];
        this.pendingJoinRequests.set(roomId, pending.filter((req) => req.socketId !== requesterId));
        this.server.to(requesterId).emit('joinApproved', {
            roomId,
            requesterId,
            username,
        });
        this.server.to(roomId).emit('guestJoined', {
            socketId: requesterId,
            username,
            timestamp: Date.now(),
        });
        console.log(`[Socket] Join approved for ${username} in room ${roomId}`);
    }
    handleDeclineJoin(client, data) {
        const { roomId, requesterId, username = 'Guest', reason = 'Host declined your request.' } = data;
        const roomUsers = this.roomUsers.get(roomId) || [];
        const host = roomUsers.find((user) => user.socketId === client.id && user.role === 'host');
        if (!host) {
            console.warn(`[Socket] Unauthorized declineJoin from ${client.id}`);
            return;
        }
        const pending = this.pendingJoinRequests.get(roomId) || [];
        this.pendingJoinRequests.set(roomId, pending.filter((req) => req.socketId !== requesterId));
        this.server.to(requesterId).emit('joinDeclined', {
            roomId,
            requesterId,
            username,
            reason,
        });
        console.log(`[Socket] Join declined for ${username} in room ${roomId}`);
    }
    handleAnswer(client, data) {
        this.server.to(data.to).emit('answer', data);
    }
    handleIceCandidate(client, data) {
        this.server.to(data.to).emit('iceCandidate', data);
    }
};
exports.LivestreamGateway = LivestreamGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], LivestreamGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], LivestreamGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], LivestreamGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendReaction'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], LivestreamGateway.prototype, "handleReaction", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('watcher'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], LivestreamGateway.prototype, "handleWatcher", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], LivestreamGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('offer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], LivestreamGateway.prototype, "handleOffer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('requestToJoin'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], LivestreamGateway.prototype, "handleRequestToJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('approveJoin'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], LivestreamGateway.prototype, "handleApproveJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('declineJoin'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], LivestreamGateway.prototype, "handleDeclineJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('answer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], LivestreamGateway.prototype, "handleAnswer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('iceCandidate'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], LivestreamGateway.prototype, "handleIceCandidate", null);
exports.LivestreamGateway = LivestreamGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], LivestreamGateway);
//# sourceMappingURL=livestream.gateway.js.map