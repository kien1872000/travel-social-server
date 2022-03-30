import { AuthService } from '@auth/auth.service';
import { ChatRoomsService } from '@chat/providers/chat-rooms.service';
import {
  forwardRef,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { corsOptions } from '@util/constants';
import { Server, Socket } from 'socket.io';
import { ConnectedSocketsService } from './connected-sockets.service';

@WebSocketGateway({
  cors: corsOptions,
})
export class ConnectedSocketsGateWay
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly authService: AuthService,
    private readonly connectedSocketsService: ConnectedSocketsService,
    @Inject(forwardRef(() => ChatRoomsService))
    private readonly chatRoomsService: ChatRoomsService,
  ) {}
  @WebSocketServer()
  server: Server;
  async handleConnection(client: Socket, ..._args: any[]) {
    try {
      const token = client.handshake.auth.token;
      const payload = this.authService.getPayloadFromAccessToken(token);
      const userId = payload._id.toString();
      if (payload && payload.isActive) {
        console.log(`client ${client.id} connected`);
        const [rooms, _] = await Promise.all([
          this.chatRoomsService.getRoomsUserHasJoined(payload._id.toString()),
          this.connectedSocketsService.saveSocket(client.id, userId),
        ]);
        await this.chatRoomsService.returnRooms(userId);
        client.join(rooms);
      } else {
        client.disconnect();
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async handleDisconnect(client: Socket) {
    const token = client.handshake.auth.token;
    const payload = this.authService.getPayloadFromAccessToken(token);
    const userId = payload._id.toString();
    await Promise.all([
      this.chatRoomsService.leaveRooms(userId),
      this.connectedSocketsService.deleteSocket(client.id),
    ]);
    console.log(`client ${client.id} disconnected`);
  }
}
