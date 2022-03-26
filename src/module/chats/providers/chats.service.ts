import { InboxOutput } from '@dto/chat/chat.dto';
import { RecentChatOutput } from '@dto/chat/recent-chat.dto';
import { Chat, ChatDocument } from '@entity/chat.entity';
import { RecentChat, RecentChatDocument } from '@entity/recent-chat.entity';
import { MapsHelper } from '@helper/maps.helper';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { paginate } from '@util/paginate';
import { PaginationRes } from '@util/types';
import { Model, Types } from 'mongoose';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
    @InjectModel(RecentChat.name)
    private readonly recentChatModel: Model<RecentChatDocument>,
    private readonly mapsHelper: MapsHelper,
  ) {}
  public async saveChat(
    owner: string,
    participants: Types.ObjectId[],
    message: string,
  ): Promise<ChatDocument> {
    try {
      const query = {
        $and: [
          { participants: { $all: participants } },
          { participants: { $size: participants.length } },
        ],
      };
      const [chat, recentChat] = await Promise.all([
        new this.chatModel({
          participants: participants,
          message: message,
          owner: Types.ObjectId(owner),
          seen: false,
        }).save(),
        this.recentChatModel.findOne(query),
      ]);
      const update = {
        chat: chat._id,
        participants: participants,
      };
      await this.recentChatModel.findByIdAndUpdate(recentChat?._id, update, {
        upsert: true,
        new: true,
      });
      console.log('recent chat', recentChat);

      return chat;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getRecentChats(
    user: string,
    page: number,
    perPage,
  ): Promise<PaginationRes<RecentChatOutput>> {
    try {
      const query = this.recentChatModel
        .find({
          participants: Types.ObjectId(user),
        })
        .populate('chat', ['owner', 'createdAt', 'message', 'seen'])
        .populate('participants', ['displayName', 'avatar'])
        .sort('-updatedAt');
      const recentChats = await paginate(query, {
        page: page,
        perPage: perPage,
      });
      return {
        items: recentChats.items.map((i) =>
          this.mapsHelper.mapToRecentChatOutput(user, i),
        ),
        meta: recentChats.meta,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getInbox(
    currentUser: string,
    partnerId: string,
    page: number,
    perPage: number,
  ): Promise<any> {
    try {
      const participants = [
        Types.ObjectId(currentUser),
        Types.ObjectId(partnerId),
      ];
      const mostRecentChat = (
        await this.chatModel
          .find({
            participants: { $all: participants },
            seen: false,
          })
          .sort('-createdAt')
          .limit(1)
      )[0];
      const seen = currentUser !== mostRecentChat?.owner.toString();
      await this.chatModel.findByIdAndUpdate(mostRecentChat?._id, {
        seen: seen,
      });
      const query = this.chatModel
        .find({
          participants: { $all: participants },
        })
        .sort('-createdAt');
      const inbox = await paginate(query, { page: page, perPage: perPage });
      return {
        items: inbox.items.map((i) =>
          this.mapsHelper.mapToInboxOutput(currentUser, i, seen),
        ),
        meta: inbox.meta,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
