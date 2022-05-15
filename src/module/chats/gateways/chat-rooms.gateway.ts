import { ChatGroupsService } from '@chat/providers/chat-groups.service';
import { ChatRoomsService } from '@chat/providers/chat-rooms.service';
import { ConnectedSocketsService } from '@connected-socket/connected-sockets.service';
import {
  AddUsersToRoomDto,
  AddUsersToRoomOutput,
  JoinRoomDto,
} from '@dto/chat/chat-room.dto';
import { UserDocument } from '@entity/user.entity';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { UsersService } from '@user/providers/users.service';
import { corsOptions } from '@util/constants';
import { Server, Socket } from 'socket.io';
import { SocketValidationPipe } from 'src/pipe/socket-validation.pipe';

const JOIN_ROOM = 'joinRoom';
const JOIN_ROOM_SUCCESS = 'joinRoomSuccess';
const LEAVE_CHAT_GROUP = 'leaveChatGroup';
const LEAVE_CHAT_GROUP_SUCCESS = 'leaveChatGroupSuccess';
const ADD_USERS_TO_CHAT_GROUP = 'addUsersToChatGroup';
const ADD_USERS_TO_CHAT_GROUP_SUCCESS = 'addUsersToRoomSuccess';
@WebSocketGateway()
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
    @MessageBody(new SocketValidationPipe()) { chatGroupId }: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const [participants, room, socket] = await Promise.all([
        this.chatGroupsService.getParticipants(chatGroupId),
        this.chatRoomsService.getRoom(chatGroupId),
        this.connectedSocketsService.getSocketBySocketId(client.id),
      ]);

      const currentUserId = (socket.user as any)._id.toString();
      if (!participants.includes(currentUserId))
        throw new WsException('Forbidden');
      let roomId;
      if (room) {
        console.log('existing room', room);

        roomId = room;
        await this.chatRoomsService.joinRoom(currentUserId, room);
        client.join(room);
      } else {
        const connectedSockets = await this.connectedSocketsService.getSockets(
          participants,
        );

        const participantSocketIds = connectedSockets.map((i) => i._id);
        const activeParticipants = connectedSockets.map((i) =>
          i.user.toString(),
        );

        const newRoom = await this.chatRoomsService.createRoom(
          participants,
          activeParticipants,
          chatGroupId,
        );
        roomId = (newRoom as any)._id.toString();
        console.log('new room', newRoom);
        const fetSocketsPromises = [];
        for (const socketId of participantSocketIds) {
          fetSocketsPromises.push(this.server.to(socketId).fetchSockets());
        }
        const fetchSockets = await Promise.all(fetSocketsPromises);
        console.log('connected sockets', participantSocketIds);

        for (const fetchSocket of fetchSockets) {
          fetchSocket[0].join(roomId);
        }
      }
      this.server.to(roomId).emit(JOIN_ROOM_SUCCESS, 'joined room success');
    } catch (error) {
      throw new WsException(error);
    }
  }
  @SubscribeMessage(LEAVE_CHAT_GROUP)
  async leaveRoom(
    @MessageBody(new SocketValidationPipe()) { chatGroupId }: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const [chatGroup, room, socket] = await Promise.all([
        this.chatGroupsService.getChatGroupById(chatGroupId),
        this.chatRoomsService.getRoom(chatGroupId),
        this.connectedSocketsService.getSocketBySocketId(client.id),
      ]);
      if (chatGroup.isPrivate)
        throw new WsException("Can't leave private chat group");
      const participants = chatGroup.participants.map((i) => i.toString());
      const currentUserId = (socket.user as any)._id.toString();
      if (!participants.includes(currentUserId))
        throw new WsException('Forbidden');
      client.leave(room);

      const user = socket.user as unknown as UserDocument;
      const [newChatGroup] = await Promise.all([
        this.chatGroupsService.leaveChatGroup(currentUserId, chatGroupId),
        this.chatRoomsService.leaveRoom(currentUserId, room),
      ]);
      this.server.to(room).emit(LEAVE_CHAT_GROUP_SUCCESS, {
        user,
        newChatGroup,
      });
    } catch (error) {
      console.log(error);

      throw new WsException(error);
    }
  }
  @SubscribeMessage(ADD_USERS_TO_CHAT_GROUP)
  async addUsersToRoom(
    @MessageBody(new SocketValidationPipe())
    { chatGroupId, userIds }: AddUsersToRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const [chatGroup, room, socket] = await Promise.all([
        this.chatGroupsService.getChatGroupById(chatGroupId),
        this.chatRoomsService.getRoom(chatGroupId),
        this.connectedSocketsService.getSocketBySocketId(client.id),
      ]);
      if (chatGroup.isPrivate)
        throw new WsException("Can't add user to private chat group");
      const participants = chatGroup.participants.map((i) => i.toString());
      const currentUserId = (socket.user as any)._id.toString();
      if (!participants.includes(currentUserId))
        throw new WsException('Forbidden');
      const usersToAdd = userIds.filter((i) => !participants.includes(i));
      if (usersToAdd.length <= 0) return;
      const connectedSockets = await this.connectedSocketsService.getSockets(
        usersToAdd,
      );
      const userToAddSocketIds = connectedSockets.map((i) => i._id);
      const activeUsers = connectedSockets.map((i) => i.user.toString());
      const [usersToAddDetail, newChatGroup] = await Promise.all([
        this.usersService.getUsers(usersToAdd),
        this.chatGroupsService.addUsersToChatGroup(
          usersToAdd,
          chatGroupId,
          currentUserId,
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
        newChatGroup: newChatGroup,
      };
      this.server.to(room).emit(ADD_USERS_TO_CHAT_GROUP_SUCCESS, message);
    } catch (error) {
      console.log(error);

      throw new WsException(error);
    }
  }
}
