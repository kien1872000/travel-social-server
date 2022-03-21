import { AuthModule } from '@auth/auth.module';
import { CommentsModule } from '@comment/comments.module';
import { Notification, NotificationSchema } from '@entity/notification.entity';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsModule } from '@post/posts.module';
import { UsersModule } from '@user/users.module';
import { ConnectedSocketsModule } from '../connected-sockets/connected-sockets.module';
import { NotificationsController } from './controllers/notifications.controller';
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
    UsersModule,
    PostsModule,
    CommentsModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsGateway, NotificationsService],
})
export class NotificationsModule {}
