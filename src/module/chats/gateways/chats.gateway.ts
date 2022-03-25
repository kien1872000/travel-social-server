import { ChatsService } from '@chat/providers/chats.service';
import { ConnectedSocketsService } from '@connected-socket/connected-sockets.service';
import { ChatMessageInput } from '@dto/chat/chat.dto';
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
import { Server, Socket } from 'socket.io';

const JOIN_ROOM = 'joinRoom';
const LEAVE_ROOM = 'leaveRoom';
const SEND_MESSAGE = 'sendMessage';
const RECEIVE_ROOM = 'receiveRoom';
const RECEIVE_MESSAGE = 'receiveMessage';
@WebSocketGateway({
  cors: {
    // origin: 'http://127.0.0.1:5500',
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway {
  constructor(
    private readonly stringHandlersHelper: StringHandlersHelper,
    private readonly chatsService: ChatsService,
    private readonly connectedSocketsService: ConnectedSocketsService,
  ) {}
  @WebSocketServer()
  server: Server;
  @SubscribeMessage(JOIN_ROOM)
  async joinRoom(
    @MessageBody() partnerId: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      //   const room = 'room#' + this.stringHandlersHelper.generateString(12);
      const room = 'room123';
      const partnerSocketId = await this.connectedSocketsService.getSocketId(
        partnerId,
      );
      const partnerSocket = (
        await this.server.to(partnerSocketId).fetchSockets()
      )[0];
      console.log(partnerSocket.id);

      client.join(room);
      partnerSocket.join(room);
      console.log(`${client.id} and ${partnerSocket.id} have joined ${room}`);

      this.server.to(room).emit(RECEIVE_ROOM, room);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  @SubscribeMessage(LEAVE_ROOM)
  leaveRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
    client.leave(room);
  }
  @SubscribeMessage(SEND_MESSAGE)
  async sendMessage(
    @MessageBody() chatMessage: ChatMessageInput,
    @ConnectedSocket() client: Socket,
  ) {
    const partnerSocket = (
      await this.server.to(chatMessage.room).fetchSockets()
    ).filter((i) => i.id !== client.id);
    const partnerSocketId = partnerSocket[0] ? partnerSocket[0].id : client.id;
    const [user, partner] = await Promise.all([
      this.connectedSocketsService.getSocketBySocketId(client.id),
      this.connectedSocketsService.getSocketBySocketId(partnerSocketId),
    ]);
    console.log(`client: ${client.id}---partner: ${partnerSocketId}`);

    const owner = (user.user as any)._id.toString();
    const participants = [(user.user as any)._id, (partner.user as any)._id];
    await this.chatsService.saveChat(owner, participants, chatMessage.message);
    const message = {
      message: chatMessage.message,
      sender: {
        _id: (user.user as any)._id.toString(),
        displayName: (user.user as unknown as UserDocument).displayName,
        avatar: (user.user as unknown as UserDocument).avatar,
      },
      receiver: {
        _id: (partner.user as any)._id.toString(),
        displayName: (partner.user as unknown as UserDocument).displayName,
        avatar: (partner.user as unknown as UserDocument).avatar,
      },
    };
    console.log('message', message);

    this.server.to(chatMessage.room).emit(RECEIVE_MESSAGE, message);
  }
}
