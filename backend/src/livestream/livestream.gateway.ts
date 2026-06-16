import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class LivestreamGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ): void {
    client.join(roomId);
  }

  @SubscribeMessage('sendMessage')
  handleSendMessage(@MessageBody() data: { roomId: string; user: string; content: string }): void {
    this.server.to(data.roomId).emit('newMessage', data);
  }

  @SubscribeMessage('sendReaction')
  handleReaction(@MessageBody() data: { roomId: string; emoji: string }): void {
    this.server.to(data.roomId).emit('onReaction', data);
  }
}