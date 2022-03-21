import { AuthService } from '@auth/auth.service';
import {
  NotificationDto,
  NotificationMessage,
} from '@dto/notification/notification.dto';
import { Notification } from '@entity/notification.entity';
import { UserDocument } from '@entity/user.entity';
import { InternalServerErrorException } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConnectedSocketsService } from 'src/module/connected-sockets/connected-sockets.service';
import { NotificationsService } from '../providers/notifications.service';

const SEND_NOTIFICATION = 'sendNotification';
const RECEIVE_NOTIFICATION = 'receiveNotification';
@WebSocketGateway({
  cors: {
    // origin: 'http://127.0.0.1:5500',
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly authService: AuthService,
    private readonly notificationsService: NotificationsService,
    private readonly connectedSocketsService: ConnectedSocketsService,
  ) {}
  @WebSocketServer()
  server: Server;
  async handleConnection(client: Socket, ..._args: any[]) {
    try {
      console.log(`client ${client.id} connected`);
      const token = client.handshake.auth.token;
      const payload = this.authService.getPayloadFromAccessToken(token);
      if (payload && payload.isActive) {
        await this.connectedSocketsService.saveSocket(
          client.id,
          payload._id.toString(),
        );
      } else {
        client.disconnect();
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async handleDisconnect(client: Socket) {
    await this.connectedSocketsService.deleteSocket(client.id);
    console.log(`client ${client.id} disconnected`);
  }
  @SubscribeMessage(SEND_NOTIFICATION)
  async sendNotification(
    @MessageBody() noti: NotificationDto,
    @ConnectedSocket() client: Socket,
  ) {
    const [sender, receiverSocketId] = await Promise.all([
      this.connectedSocketsService.getSocketBySocketId(client.id),
      this.connectedSocketsService.getSocketId(noti.receiver),
    ]);
    const notification = await this.notificationsService.create({
      sender: (sender.user as any)._id.toString(),
      receiver: noti.receiver,
      postId: noti.postId,
      commentId: noti.commentId,
      action: noti.action,
    });
    const message: NotificationMessage = {
      sender: {
        _id: (sender.user as any)._id.toString(),
        displayName: (sender.user as unknown as UserDocument).displayName,
        avatar: (sender.user as unknown as UserDocument).avatar,
      },
      postId: noti.postId,
      commentId: noti.commentId,
      action: noti.action,
      createdAt: (notification as any).createdAt,
      seen: false,
    };
    this.server.to(receiverSocketId).emit(RECEIVE_NOTIFICATION, message);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit(RECEIVE_NOTIFICATION, message);
    }
  }
}