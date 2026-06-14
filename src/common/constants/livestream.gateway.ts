import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LivestreamService } from './livestream.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'livestream' })
export class LivestreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly livestreamService: LivestreamService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('heartbeat')
  async handleHeartbeat(client: Socket, data: { streamId: string; userId: string }) {
    await this.livestreamService.updateHeartbeat(data.streamId, data.userId);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
  }

  /**
   * Broadcasts PDF page changes to everyone in the room except the sender
   */
  @SubscribeMessage('pageUpdate')
  async handlePageUpdate(client: Socket, data: { streamId: string; userId: string; page: number }) {
    if (typeof data.page !== 'number' || data.page < 1) {
      client.emit('error', { message: 'Invalid page number' });
      return;
    }

    try {
      const updatedStream = await this.livestreamService.updatePdfPage(data.streamId, data.userId, data.page);
      
      // Emit to all participants in the stream room
      this.server.to(data.streamId).emit('onPageChanged', {
        page: updatedStream.currentPdfPage,
        updatedBy: data.userId
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      client.emit('error', { message: errorMessage });
    }
  }

  /**
   * Handles real-time chat messages
   */
  @SubscribeMessage('sendMessage')
  handleMessage(client: Socket, data: { streamId: string; userId: string; userName: string; text: string }) {
    this.server.to(data.streamId).emit('onMessage', {
      ...data,
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handles real-time reactions (emojis) broadcast to all participants
   */
  @SubscribeMessage('sendReaction')
  handleReaction(client: Socket, data: { streamId: string; userId: string; emoji: string }) {
    this.server.to(data.streamId).emit('onReaction', {
      emoji: data.emoji,
      userId: data.userId,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      // Animation metadata for the frontend to trigger micro-animations
      animationType: Math.random() > 0.5 ? 'float' : 'burst',
      intensity: Math.floor(Math.random() * 3) + 1,
    });
  }

  /**
   * Real-time typing indicators for a more "alive" feel
   */
  @SubscribeMessage('typing')
  handleTyping(client: Socket, data: { streamId: string; userId: string; userName: string; isTyping: boolean }) {
    client.to(data.streamId).emit('onTyping', {
      userId: data.userId,
      userName: data.userName,
      isTyping: data.isTyping
    });
  }

  /**
   * Signal from a participant that they wish to share their screen.
   * Broadcasts to the room so the Host sees the notification.
   */
  @SubscribeMessage('raiseHand')
  handleRaiseHand(client: Socket, data: { streamId: string; userId: string; userName: string }) {
    this.server.to(data.streamId).emit('onHandRaised', {
      userId: data.userId,
      userName: data.userName,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notifies the room when a participant mutes/unmutes.
   * This ensures the UI "Mute" icons are functional and realistic in real-time.
   */
  @SubscribeMessage('toggleMute')
  handleMuteToggle(client: Socket, data: { streamId: string; userId: string; isMuted: boolean }) {
    this.server.to(data.streamId).emit('onMuteStatusChanged', {
      userId: data.userId,
      isMuted: data.isMuted,
    });
  }

  /**
   * Host grants permission to a participant to share their screen.
   */
  @SubscribeMessage('grantScreenShare')
  async handleGrantScreenShare(client: Socket, data: { streamId: string; hostId: string; participantId: string }) {
    const isHost = await this.livestreamService.isHost(data.streamId, data.hostId);
    
    if (isHost) {
      this.server.to(data.streamId).emit('onScreenShareGranted', {
        participantId: data.participantId,
        grantedBy: data.hostId,
      });
    }
  }

  /**
   * Host remotely mutes a participant. 
   * Ensures the UI "Mute" icons and audio state are functional across all devices.
   */
  @SubscribeMessage('remoteMute')
  async handleRemoteMute(client: Socket, data: { streamId: string; hostId: string; participantId: string; mute: boolean }) {
    const isHost = await this.livestreamService.isHost(data.streamId, data.hostId);
    if (isHost) {
      this.server.to(data.streamId).emit('onRemoteMute', {
        participantId: data.participantId,
        isMuted: data.mute,
      });
    }
  }
}