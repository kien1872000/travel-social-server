import { ChatRoom, ChatRoomDocument } from '@entity/chat-room.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class ChatRoomsService {
  constructor(
    @InjectModel(ChatRoom.name)
    private readonly chatRoomModel: Model<ChatRoomDocument>,
  ) {}
  public async createRoom(
    participants: string[],
    activeParticipants: string[],
    chatGroup: string,
  ): Promise<ChatRoomDocument> {
    try {
      const createRoom = {
        participants: participants.map((i) => {
          return {
            _id: Types.ObjectId(i),
            isActive: activeParticipants.includes(i),
          };
        }),
        chatGroup: Types.ObjectId(chatGroup),
      };
      const room = await this.chatRoomModel.findOneAndUpdate(
        {
          chatGroup: Types.ObjectId(chatGroup),
        },
        createRoom,
        { upsert: true, new: true },
      );
      return room;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async addUsersToRoom(
    userIds: string[],
    roomId: string,
    activeUsers: string[],
  ) {
    try {
      const participants = userIds.map((i) => {
        return {
          _id: Types.ObjectId(i),
          isActive: activeUsers.includes(i),
        };
      });
      await this.chatRoomModel.findByIdAndUpdate(roomId, {
        $push: { participants: { $each: participants } },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async returnRooms(userId: string): Promise<void> {
    try {
      await this.chatRoomModel.updateMany(
        { 'participants._id': Types.ObjectId(userId) },
        { $set: { 'participants.$.isActive': true } },
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async joinRoom(userId: string, roomId: string): Promise<void> {
    try {
      await this.chatRoomModel.findOneAndUpdate(
        {
          _id: Types.ObjectId(roomId),
          'participants._id': Types.ObjectId(userId),
        },
        {
          $set: { 'participants.$.isActive': true },
        },
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async leaveRooms(userId: string): Promise<void> {
    try {
      const rooms = await this.chatRoomModel.find({
        'participants._id': Types.ObjectId(userId),
      });
      const notActiveRooms = rooms.filter((i) => {
        const activeParticipants = i.participants.filter(
          (participant) => participant.isActive === true,
        );
        return activeParticipants.length <= 1;
      });
      if (notActiveRooms.length > 0) {
        const notActiveRoomIds = notActiveRooms.map((i) => i._id);
        await this.chatRoomModel.deleteMany({ _id: { $in: notActiveRoomIds } });
      }
      await this.chatRoomModel.updateMany(
        { 'participants._id': Types.ObjectId(userId) },
        { $set: { 'participants.$.isActive': false } },
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async leaveRoom(userId: string, roomId: string): Promise<void> {
    try {
      const room = await this.chatRoomModel.findById(roomId);
      const activeParticipants = room.participants.filter(
        (i) => i.isActive === true,
      );
      if (activeParticipants.length <= 1) {
        await this.chatRoomModel.findByIdAndDelete(roomId);
      } else {
        await this.chatRoomModel.updateOne(
          { 'participants._id': Types.ObjectId(userId) },
          { $set: { 'participants.$.isActive': false } },
        );
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getRoomsUserHasJoined(userId: string): Promise<string[]> {
    try {
      const rooms = await this.chatRoomModel.find({
        'participants._id': Types.ObjectId(userId),
      });
      return rooms.map((i) => i._id.toString());
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getRoom(chatGroupId: string): Promise<string> {
    try {
      return (
        await this.chatRoomModel.findOne({
          chatGroup: Types.ObjectId(chatGroupId),
        })
      )._id.toString();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  
}
