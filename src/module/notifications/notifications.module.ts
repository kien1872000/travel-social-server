import { AuthModule } from '@auth/auth.module';
import { Notification, NotificationSchema } from '@entity/notification.entity';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConnectedSocketsModule } from '../connected-sockets/connected-sockets.module';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { NotificationsService } from './providers/notifications.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Notification.name,
        schema: NotificationSchema,
      },
    ]),
    AuthModule,
    ConnectedSocketsModule,
  ],
  providers: [NotificationsGateway, NotificationsService],
})
export class NotificationsModule {}
