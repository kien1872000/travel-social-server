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
import { corsOptions } from '@util/constants';
import { Server, Socket } from 'socket.io';
import { ConnectedSocketsService } from 'src/module/connected-sockets/connected-sockets.service';
import { NotificationsService } from '../providers/notifications.service';

const SEND_NOTIFICATION = 'sendNotification';
const RECEIVE_NOTIFICATION = 'receiveNotification';
@WebSocketGateway()
export class NotificationsGateway {
  constructor(
    private readonly authService: AuthService,
    private readonly notificationsService: NotificationsService,
    private readonly connectedSocketsService: ConnectedSocketsService,
  ) {}

  @WebSocketServer()
  server: Server;
  @SubscribeMessage(SEND_NOTIFICATION)
  async sendNotification(
    @MessageBody() noti: NotificationDto,
    @ConnectedSocket() client: Socket,
  ) {
    const [sender, receiverSocketId] = await Promise.all([
      this.connectedSocketsService.getSocketBySocketId(client.id),
      this.connectedSocketsService.getSocketId(noti.receiver),
    ]);
    if ((sender.user as any)._id.toString() === noti.receiver) return;
    console.log('haha', noti);

    const notification = await this.notificationsService.create({
      sender: (sender.user as any)._id.toString(),
      receiver: noti.receiver,
      postId: noti.postId,
      commentId: noti.commentId,
      action: noti.action,
    });
    const message: NotificationMessage = {
      notificationId: (notification as any)._id.toString(),
      sender: {
        _id: (sender.user as any)._id.toString(),
        displayName: (sender.user as unknown as UserDocument).displayName,
        avatar: (sender.user as unknown as UserDocument).avatar,
      },
      action: noti.action,
      createdAt: (notification as any).createdAt,
      seen: false,
    };

    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit(RECEIVE_NOTIFICATION, message);
    }
  }
}
