import { ChatGroupsService } from '@chat/providers/chat-groups.service';
import { ChatRoomsService } from '@chat/providers/chat-rooms.service';
import { ConnectedSocketsService } from '@connected-socket/connected-sockets.service';
import {
  AddUsersToRoomDto,
  AddUsersToRoomOutput,
} from '@dto/chat/chat-room.dto';
import { UserDocument } from '@entity/user.entity';
import { InternalServerErrorException } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UsersService } from '@user/providers/users.service';
import { corsOptions } from '@util/constants';
import { Server, Socket } from 'socket.io';

const JOIN_ROOM = 'joinRoom';
const JOIN_ROOM_SUCCESS = 'joinRoomSuccess';
const LEAVE_CHAT_GROUP = 'leaveChatGroup';
const LEAVE_CHAT_GROUP_SUCCESS = 'leaveChatGroupSuccess';
const ADD_USERS_TO_CHAT_GROUP = 'addUsersToRoom';
const ADD_USERS_TO_CHAT_GROUP_SUCCESS = 'addUsersToRoomSuccess';
@WebSocketGateway({ cors: corsOptions })
export class ChatRoomsGateWay {
  constructor(
    private readonly chatGroupsService: ChatGroupsService,
    private readonly chatRoomsService: ChatRoomsService,
    private readonly connectedSocketsService: ConnectedSocketsService,
    private readonly usersService: UsersService,
  ) {}
  @WebSocketServer()
  server: Server;
  @SubscribeMessage(JOIN_ROOM)
  async joinRoom(
    @MessageBody() chatGroupId: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const [participants, room, socket] = await Promise.all([
        this.chatGroupsService.getParticipants(chatGroupId),
        this.chatRoomsService.getRoom(chatGroupId),
        this.connectedSocketsService.getSocketBySocketId(client.id),
      ]);
      const currentUserId = (socket.user as any)._id.toString();
      if (!participants.includes(currentUserId)) return;
      let roomId;
      if (room) {
        roomId = room;
        await this.chatRoomsService.joinRoom(currentUserId, room);
        client.join(room);
      } else {
        const connectedSockets = await this.connectedSocketsService.getSockets(
          participants,
        );
        const participantSocketIds = connectedSockets.map((i) => i.socketId);
        const activeParticipants = connectedSockets.map((i) =>
          i.user.toString(),
        );

        const newRoom = await this.chatRoomsService.createRoom(
          participants,
          activeParticipants,
          chatGroupId,
        );
        roomId = (newRoom as any)._id.toString();

        const fetSocketsPromises = [];
        for (const socketId of participantSocketIds) {
          fetSocketsPromises.push(this.server.to(socketId).fetchSockets());
        }
        const fetchSockets = await Promise.all(fetSocketsPromises);

        for (const fetchSocket of fetchSockets) {
          fetchSocket[0].join(roomId);
        }
      }

      this.server.to(roomId).emit(JOIN_ROOM_SUCCESS);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  @SubscribeMessage(LEAVE_CHAT_GROUP)
  async leaveRoom(
    @MessageBody() chatGroupId: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const [participants, room, socket] = await Promise.all([
        this.chatGroupsService.getParticipants(chatGroupId),
        this.chatRoomsService.getRoom(chatGroupId),
        this.connectedSocketsService.getSocketBySocketId(client.id),
      ]);
      const currentUserId = (socket.user as any)._id.toString();
      if (!participants.includes(currentUserId)) return;
      client.leave(room);

      const user = socket.user as unknown as UserDocument;
      await Promise.all([
        this.chatRoomsService.leaveRoom(currentUserId, chatGroupId),
        this.chatGroupsService.leaveChatGroup(currentUserId, chatGroupId),
      ]);
      this.server.to(room).emit(LEAVE_CHAT_GROUP_SUCCESS, user);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  @SubscribeMessage(ADD_USERS_TO_CHAT_GROUP)
  async addUsersToRoom(
    @MessageBody() addusersToRoomDto: AddUsersToRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const [participants, room, socket] = await Promise.all([
        this.chatGroupsService.getParticipants(addusersToRoomDto.chatGoupId),
        this.chatRoomsService.getRoom(addusersToRoomDto.chatGoupId),
        this.connectedSocketsService.getSocketBySocketId(client.id),
      ]);
      const currentUserId = (socket.user as any)._id.toString();
      if (!participants.includes(currentUserId)) return;
      const usersToAdd = addusersToRoomDto.userIds.filter(
        (i) => !participants.includes(i),
      );
      if (usersToAdd.length <= 0) return;
      const connectedSockets = await this.connectedSocketsService.getSockets(
        usersToAdd,
      );
      const userToAddSocketIds = connectedSockets.map((i) => i.socketId);
      const activeUsers = connectedSockets.map((i) => i.user.toString());
      const [usersToAddDetail, _, __] = await Promise.all([
        this.usersService.getUsers(usersToAdd),
        this.chatGroupsService.addUsersToChatGroup(
          usersToAdd,
          addusersToRoomDto.chatGoupId,
        ),
        this.chatRoomsService.addUsersToRoom(usersToAdd, room, activeUsers),
      ]);
      const fetSocketsPromises = [];
      for (const socketId of userToAddSocketIds) {
        fetSocketsPromises.push(this.server.to(socketId).fetchSockets());
      }
      const fetchSockets = await Promise.all(fetSocketsPromises);

      for (const fetchSocket of fetchSockets) {
        fetchSocket[0].join(room);
      }
      const message: AddUsersToRoomOutput = {
        adder: {
          _id: currentUserId,
          displayName: (socket.user as unknown as UserDocument).displayName,
        },
        addedUsers: usersToAddDetail.map((i) => {
          return {
            _id: (i as any)._id.toString(),
            displayName: i.displayName,
          };
        }),
      };
      this.server.to(room).emit(ADD_USERS_TO_CHAT_GROUP_SUCCESS, message);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
