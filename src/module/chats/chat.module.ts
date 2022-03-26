import { ConnectedSocketsModule } from '@connected-socket/connected-sockets.module';
import { Chat, ChatSchema } from '@entity/chat.entity';
import { RecentChat, RecentChatSchema } from '@entity/recent-chat.entity';
import { MapsHelper } from '@helper/maps.helper';
import { StringHandlersHelper } from '@helper/string-handler.helper';
import { Controller, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from '@user/providers/users.service';
import { UsersModule } from '@user/users.module';
import { ChatsController } from './controllers/chats.controller';
import { ChatGateway } from './gateways/chats.gateway';
import { ChatsService } from './providers/chats.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Chat.name,
        schema: ChatSchema,
      },
      {
        name: RecentChat.name,
        schema: RecentChatSchema,
      },
    ]),
    ConnectedSocketsModule,
    UsersModule,
  ],
  providers: [ChatsService, ChatGateway, StringHandlersHelper, MapsHelper],
  controllers: [ChatsController],
})
export class ChatsModule {}
