import 'reflect-metadata';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

interface RoomUser {
  socketId: string;
  username: string;
  role: 'host' | 'viewer';
  timestamp: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class LivestreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private roomUsers = new Map<string, RoomUser[]>();
  private userRooms = new Map<string, string>();
  private pendingJoinRequests = new Map<string, Array<{ socketId: string; username: string; timestamp: number }>>();

  handleConnection(client: Socket): void {
    console.log(`[Socket] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    console.log(`[Socket] Client disconnected: ${client.id}`);
    
    const roomId = this.userRooms.get(client.id);
    if (roomId) {
      const users = this.roomUsers.get(roomId) || [];
      const filtered = users.filter(u => u.socketId !== client.id);
      
      if (filtered.length > 0) {
        this.roomUsers.set(roomId, filtered);
      } else {
        this.roomUsers.delete(roomId);
      }

      const pending = this.pendingJoinRequests.get(roomId) || [];
      const pendingFiltered = pending.filter((req) => req.socketId !== client.id);
      if (pendingFiltered.length > 0) {
        this.pendingJoinRequests.set(roomId, pendingFiltered);
      } else {
        this.pendingJoinRequests.delete(roomId);
      }
      
      this.userRooms.delete(client.id);
      
      // Notify room about user leaving
      this.server.to(roomId).emit('userLeft', {
        socketId: client.id,
        timestamp: Date.now(),
      });
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; role?: string; username?: string },
  ): void {
    const { roomId, role = 'viewer', username = 'Anonymous' } = payload;
    
    client.join(roomId);
    this.userRooms.set(client.id, roomId);
    
    // Add user to room
    const roomUsers = this.roomUsers.get(roomId) || [];
    roomUsers.push({
      socketId: client.id,
      username,
      role: role as 'host' | 'viewer',
      timestamp: Date.now(),
    });
    this.roomUsers.set(roomId, roomUsers);
    
    console.log(`[Socket] ${username} joined room ${roomId} as ${role}`);
    
    // Notify room
    this.server.to(roomId).emit('peerJoined', {
      socketId: client.id,
      role,
      username,
      roomUsers: roomUsers.length,
      timestamp: Date.now(),
    });
  }

  @SubscribeMessage('sendMessage')
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; user: string; content: string },
  ): void {
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

  @SubscribeMessage('sendReaction')
  handleReaction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; emoji: string; username?: string },
  ): void {
    if (!data.roomId || !data.emoji) {
      console.warn('[Socket] Invalid reaction data');
      return;
    }
    
    console.log(`[Socket] Reaction in ${data.roomId}: ${data.emoji} from ${client.id}`);
    
    // Emit to entire room INCLUDING sender (for local confirmation)
    this.server.to(data.roomId).emit('onReaction', {
      emoji: data.emoji,
      socketId: client.id,
      username: data.username || 'User',
      timestamp: Date.now(),
    });
  }

  @SubscribeMessage('watcher')
  handleWatcher(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; viewerId: string },
  ): void {
    const roomId = data.roomId;
    const roomUsers = this.roomUsers.get(roomId) || [];
    
    console.log(`[Socket] Watcher update for ${roomId}: ${roomUsers.length} users`);
    
    this.server.to(roomId).emit('watcher', {
      viewerId: data.viewerId,
      count: roomUsers.length,
      timestamp: Date.now(),
    });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ): void {
    const roomId = data.roomId;
    client.leave(roomId);
    
    const roomUsers = this.roomUsers.get(roomId) || [];
    const filtered = roomUsers.filter(u => u.socketId !== client.id);
    
    if (filtered.length > 0) {
      this.roomUsers.set(roomId, filtered);
    } else {
      this.roomUsers.delete(roomId);
    }
    
    this.userRooms.delete(client.id);

    const pending = this.pendingJoinRequests.get(roomId) || [];
    const pendingFiltered = pending.filter((req) => req.socketId !== client.id);
    if (pendingFiltered.length > 0) {
      this.pendingJoinRequests.set(roomId, pendingFiltered);
    } else {
      this.pendingJoinRequests.delete(roomId);
    }
    
    console.log(`[Socket] User left room ${roomId}`);
    
    this.server.to(roomId).emit('userLeft', {
      socketId: client.id,
      roomUsers: filtered.length,
      timestamp: Date.now(),
    });
  }

  @SubscribeMessage('offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; offer: any; from: string; to: string },
  ): void {
    this.server.to(data.to).emit('offer', data);
  }

  @SubscribeMessage('requestToJoin')
  handleRequestToJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; username?: string },
  ): void {
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

  @SubscribeMessage('approveJoin')
  handleApproveJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; requesterId: string; username?: string },
  ): void {
    const { roomId, requesterId, username = 'Guest' } = data;
    const roomUsers = this.roomUsers.get(roomId) || [];
    const host = roomUsers.find((user) => user.socketId === client.id && user.role === 'host');

    if (!host) {
      console.warn(`[Socket] Unauthorized approveJoin from ${client.id}`);
      return;
    }

    const pending = this.pendingJoinRequests.get(roomId) || [];
    this.pendingJoinRequests.set(
      roomId,
      pending.filter((req) => req.socketId !== requesterId),
    );

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

  @SubscribeMessage('declineJoin')
  handleDeclineJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; requesterId: string; username?: string; reason?: string },
  ): void {
    const { roomId, requesterId, username = 'Guest', reason = 'Host declined your request.' } = data;
    const roomUsers = this.roomUsers.get(roomId) || [];
    const host = roomUsers.find((user) => user.socketId === client.id && user.role === 'host');

    if (!host) {
      console.warn(`[Socket] Unauthorized declineJoin from ${client.id}`);
      return;
    }

    const pending = this.pendingJoinRequests.get(roomId) || [];
    this.pendingJoinRequests.set(
      roomId,
      pending.filter((req) => req.socketId !== requesterId),
    );

    this.server.to(requesterId).emit('joinDeclined', {
      roomId,
      requesterId,
      username,
      reason,
    });

    console.log(`[Socket] Join declined for ${username} in room ${roomId}`);
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; answer: any; from: string; to: string },
  ): void {
    this.server.to(data.to).emit('answer', data);
  }

  @SubscribeMessage('iceCandidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; candidate: any; from: string; to: string },
  ): void {
    this.server.to(data.to).emit('iceCandidate', data);
  }
}