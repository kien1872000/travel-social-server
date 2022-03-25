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
      const chat = await new this.chatModel({
        participants: participants,
        message: message,
        owner: Types.ObjectId(owner),
        seen: false,
      }).save();
      const query = {
        $and: [
          { participants: { $all: participants } },
          { participants: { $size: participants.length } },
        ],
      };
      const update = {
        chat: chat._id,
        participants: participants,
      };
      const recentChat = await this.recentChatModel.findOne(query);
      if (recentChat) {
        await this.recentChatModel.findByIdAndUpdate(recentChat._id, update);
      } else {
        await new this.recentChatModel(update).save();
      }
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
        .populate('participants', ['displayName', 'avatar']);
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
}
