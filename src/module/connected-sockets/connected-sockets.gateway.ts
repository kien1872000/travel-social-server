import { AuthService } from '@auth/auth.service';
import { ChatRoomsService } from '@chat/providers/chat-rooms.service';
import { forwardRef, Inject } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { corsOptions } from '@util/constants';
import { ClientRequest } from 'http';
import { Server, Socket } from 'socket.io';
import { ConnectedSocketsService } from './connected-sockets.service';

@WebSocketGateway()
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
      if (payload && payload.isActive) {
        const userId = payload._id.toString();
        console.log(`client ${client.id} connected`);
        const [rooms, oldSocketIds] = await Promise.all([
          this.chatRoomsService.getRoomsUserHasJoined(payload._id.toString()),
          this.connectedSocketsService.saveSocket(client.id, userId),
          this.chatRoomsService.returnRooms(userId),
        ]);
        const promises = [];
        for (const osk of oldSocketIds) {
          promises.push(this.server.to(osk).fetchSockets());
        }
        const oldSockets = await Promise.all(promises);

        for (const osk of oldSockets) {
          osk[0]?.disconnect();
        }

        client.join(rooms);
      } else {
        client.disconnect();
      }
    } catch (error) {
      console.log(error);

      client.disconnect();
    }
  }
  async handleDisconnect(client: Socket) {
    try {
      const socket = await this.connectedSocketsService.getSocketBySocketId(
        client.id,
      );
      client.disconnect();
      if (socket) {
        await Promise.all([
          this.chatRoomsService.leaveRooms((socket.user as any)._id.toString()),
          this.connectedSocketsService.deleteSocket(client.id),
        ]);
        console.log(`client ${client.id} disconnected`);
      }
    } catch (error) {
      throw new WsException(error);
    }
  }
}
