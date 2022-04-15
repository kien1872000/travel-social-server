import { ConnectedSocketsModule } from '@connected-socket/connected-sockets.module';
import { ChatGroup, ChatGroupSchema } from '@entity/chat-group.entity';
import { ChatRoom, ChatRoomSchema } from '@entity/chat-room.entity';
import { Chat, ChatSchema } from '@entity/chat.entity';
import { RecentChat, RecentChatSchema } from '@entity/recent-chat.entity';
import { MapsHelper } from '@helper/maps.helper';
import { StringHandlersHelper } from '@helper/string-handler.helper';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '@user/users.module';
import { ChatsController } from './controllers/chats.controller';
import { ChatRoomsGateWay } from './gateways/chat-rooms.gateway';
import { ChatGateway } from './gateways/chats.gateway';
import { ChatGroupsService } from './providers/chat-groups.service';
import { ChatRoomsService } from './providers/chat-rooms.service';
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
      {
        name: ChatGroup.name,
        schema: ChatGroupSchema,
      },
      {
        name: ChatRoom.name,
        schema: ChatRoomSchema,
      },
    ]),
    ConnectedSocketsModule,
    UsersModule,
  ],
  providers: [
    ChatGroupsService,
    ChatsService,
    ChatGateway,
    StringHandlersHelper,
    MapsHelper,
    ChatRoomsService,
    ChatRoomsGateWay,
  ],
  exports: [ChatRoomsService, ChatGroupsService],
  controllers: [ChatsController],
})
export class ChatsModule {}
