import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LivestreamService } from './livestream.service';
import { Logger } from '@nestjs/common';

/**
 * LivestreamGateway
 * 
 * Handles real-time signaling for the livestreaming experience.
 * This enables features like "Participant Joined" notifications,
 * real-time screen share toggling, and PDF page synchronization.
 * 
 * We use rooms (streamId) to isolate traffic so that events in one 
 * livestream don't bleed into another.
 */
@WebSocketGateway({
  namespace: 'livestream',
  cors: { origin: '*' },
})
export class LivestreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(LivestreamGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly livestreamService: LivestreamService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected for livestreaming: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from livestreaming: ${client.id}`);
  }

  @SubscribeMessage('joinStream')
  async handleJoinStream(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { streamId: string; userId: string },
  ) {
    const { streamId, userId } = data;
    await this.livestreamService.joinStream(streamId, userId);
    
    client.join(streamId);
    this.server.to(streamId).emit('participantJoined', { userId });
    
    this.logger.log(`User ${userId} joined livestream ${streamId}`);
  }

  @SubscribeMessage('leaveStream')
  async handleLeaveStream(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { streamId: string; userId: string },
  ) {
    const { streamId, userId } = data;
    client.leave(streamId);
    client.to(streamId).emit('participantLeft', { userId });
  }

  @SubscribeMessage('toggleScreenShare')
  async handleScreenShare(
    @MessageBody() data: { streamId: string; userId: string; isSharing: boolean; url?: string },
  ) {
    const { streamId, userId, isSharing, url } = data;
    await this.livestreamService.toggleScreenShare(streamId, userId, isSharing, url);
    this.server.to(streamId).emit('screenShareStateChanged', { isSharing, activePresentationUrl: url });
  }

  @SubscribeMessage('changePdfPage')
  async handlePdfPageChange(
    @MessageBody() data: { streamId: string; userId: string; page: number },
  ) {
    const { streamId, userId, page } = data;
    await this.livestreamService.updatePdfPage(streamId, userId, page);
    this.server.to(streamId).emit('pdfPageChanged', { page });
  }

  @SubscribeMessage('shareFile')
  async handleFileShare(
    @MessageBody() data: { streamId: string; userId: string; fileUrl: string; fileType: string },
  ) {
    const { streamId, userId, fileUrl, fileType } = data;
    const file = await this.livestreamService.shareFile(streamId, userId, fileUrl, fileType);
    // Broadcast the new file to all participants so it appears in their "Shared Files" tab
    this.server.to(streamId).emit('fileShared', file);
  }
}