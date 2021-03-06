import { ChatGroupsService } from '@chat/providers/chat-groups.service';
import { ChatRoomsService } from '@chat/providers/chat-rooms.service';
import { ChatsService } from '@chat/providers/chats.service';
import { ConnectedSocketsService } from '@connected-socket/connected-sockets.service';
import { ChatMessageInput, ChatMessageOutput } from '@dto/chat/chat.dto';
import { UserDocument } from '@entity/user.entity';
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { corsOptions } from '@util/constants';
import { Server, Socket } from 'socket.io';
import { SocketValidationPipe } from 'src/pipe/socket-validation.pipe';

const SEND_MESSAGE = 'sendMessage';
const RECEIVE_MESSAGE = 'receiveMessage';
@WebSocketGateway()
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
    @MessageBody(new SocketValidationPipe())
    chatMessageInput: ChatMessageInput,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { chatGroupId, message } = chatMessageInput;
      const [participants, room, socket] = await Promise.all([
        this.chatGroupsService.getParticipants(chatGroupId),
        this.chatRoomsService.getRoom(chatGroupId),
        this.connectedSocketsService.getSocketBySocketId(client.id),
      ]);
      const currentUserId = (socket.user as any)._id.toString();

      if (!participants.includes(currentUserId)) return;
      console.log(`client: ${client.id}---partner: ${chatGroupId}`);

      const chat = await this.chatsService.saveChat(
        currentUserId,
        chatGroupId,
        message,
      );
      const messageToSendOther: ChatMessageOutput = {
        chatGroupId: chatGroupId,
        isCurrentUserMessage: false,
        message: message,
        userId: currentUserId,
        displayName: (socket.user as unknown as UserDocument).displayName,
        avatar: (socket.user as unknown as UserDocument).avatar,
        createdAt: (chat as any).createdAt,
      };
      const messageToSendOwner = JSON.parse(JSON.stringify(messageToSendOther));
      messageToSendOwner.isCurrentUserMessage = true;
      console.log('message', messageToSendOther);
      this.server.to(client.id).emit(RECEIVE_MESSAGE, messageToSendOwner);
      client.to(room).emit(RECEIVE_MESSAGE, messageToSendOther);
    } catch (error) {
      throw new WsException(error);
    }
  }
}
