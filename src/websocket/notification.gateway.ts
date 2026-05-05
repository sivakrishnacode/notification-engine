// src/websocket/notification.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  namespace: '/notifications',
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server!: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  afterInit(): void {
    this.logger.log('WebSocket gateway initialised on namespace /notifications');
  }

  handleConnection(client: Socket): void {
    const userId = client.handshake.query['userId'] as string | undefined;

    if (!userId) {
      this.logger.warn(`Client connected without userId (socket=${client.id}) — disconnecting`);
      client.disconnect();
      return;
    }

    // Each user joins a room named after their userId
    void client.join(userId);
    this.logger.log(`Client ${client.id} joined room: ${userId}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  /**
   * Emits a "notification" event to all sockets in the given userId room.
   */
  emitToUser(userId: string, payload: Record<string, unknown>): void {
    this.server.to(userId).emit('notification', payload);
    this.logger.debug(`Emitted notification to room: ${userId}`);
  }
}
