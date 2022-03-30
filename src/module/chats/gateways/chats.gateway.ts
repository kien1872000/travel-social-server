import { ChatGroupsService } from '@chat/providers/chat-groups.service';
import { ChatRoomsService } from '@chat/providers/chat-rooms.service';
import { ChatsService } from '@chat/providers/chats.service';
import { ConnectedSocketsService } from '@connected-socket/connected-sockets.service';
import { ChatMessageInput, ChatMessageOutput } from '@dto/chat/chat.dto';
import { UserDocument } from '@entity/user.entity';
import { StringHandlersHelper } from '@helper/string-handler.helper';
import { InternalServerErrorException } from '@nestjs/common';
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { UsersService } from '@user/providers/users.service';
import { corsOptions } from '@util/constants';
import { Server, Socket } from 'socket.io';


const SEND_MESSAGE = 'sendMessage';
const RECEIVE_MESSAGE = 'receiveMessage';
@WebSocketGateway({
  cors: corsOptions,
})
export class ChatGateway {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly chatGroupsService: ChatGroupsService,
    private readonly chatRoomsService: ChatRoomsService,
    private readonly connectedSocketsService: ConnectedSocketsService,
  ) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage(SEND_MESSAGE)
  async sendMessage(
    @MessageBody() chatMessage: ChatMessageInput,
    @ConnectedSocket() client: Socket,
  ) {
    const [participants, room, socket] = await Promise.all([
      this.chatGroupsService.getParticipants(chatMessage.chatGroupId),
      this.chatRoomsService.getRoom(chatMessage.chatGroupId),
      this.connectedSocketsService.getSocketBySocketId(client.id),
    ]);
    const currentUserId = (socket.user as any)._id.toString();

    if (!participants.includes(currentUserId)) return;
    console.log(`client: ${client.id}---partner: ${chatMessage.chatGroupId}`);

    const chat = await this.chatsService.saveChat(
      currentUserId,
      chatMessage.chatGroupId,
      chatMessage.message,
    );
    const message: ChatMessageOutput = {
      message: chatMessage.message,
      userId: currentUserId,
      displayName: (socket.user as unknown as UserDocument).displayName,
      avatar: (socket.user as unknown as UserDocument).avatar,
      createdAt: (chat as any).createdAt,
    };
    console.log('message', message);

    this.server.to(room).emit(RECEIVE_MESSAGE, message);
  }
}
