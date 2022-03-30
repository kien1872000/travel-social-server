import { CreateChatGroupDto } from '@dto/chat/chat-group.dto';
import { InboxOutput } from '@dto/chat/chat.dto';
import { RecentChatOutput } from '@dto/chat/recent-chat.dto';
import { ChatGroup, ChatGroupDocument } from '@entity/chat-group.entity';
import { Chat, ChatDocument } from '@entity/chat.entity';
import { RecentChat, RecentChatDocument } from '@entity/recent-chat.entity';
import { MapsHelper } from '@helper/maps.helper';
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UsersService } from '@user/providers/users.service';
import { paginate } from '@util/paginate';
import { PaginationRes } from '@util/types';
import { Model, Types } from 'mongoose';
import { ChatGroupsService } from './chat-groups.service';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
    @InjectModel(RecentChat.name)
    private readonly recentChatModel: Model<RecentChatDocument>,
    private readonly mapsHelper: MapsHelper,
    private readonly usersService: UsersService,
    private readonly chatGroupsService: ChatGroupsService,
  ) {}

  public async saveChat(
    owner: string,
    chatGroup: string,
    message: string,
  ): Promise<ChatDocument> {
    try {
      const chat = await new this.chatModel({
        chatGroup: Types.ObjectId(chatGroup),
        message: message,
        owner: Types.ObjectId(owner),
        seen: false,
      }).save();

      const recentChat = await this.recentChatModel.findOneAndUpdate(
        { chatGroup: chatGroup },
        { chatGroup: chatGroup, chat: chat._id },
        {
          upsert: true,
          new: true,
        },
      );
      console.log('recent chat', recentChat);

      return chat;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getRecentChats(
    user: string,
    page: number,
    perPage: number,
  ): Promise<PaginationRes<RecentChatOutput>> {
    try {
      const query = this.recentChatModel
        .find({
          participants: Types.ObjectId(user),
        })
        .populate('chat', ['owner', 'createdAt', 'message', 'seen'])
        .populate('chatGroup', ['name', 'image'])
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
    chatGroupId: string,
    page: number,
    perPage: number,
  ): Promise<PaginationRes<InboxOutput>> {
    try {
      const [chatGroup, recentChat] = await Promise.all([
        this.chatGroupsService.getChatGroupById(chatGroupId),
        this.recentChatModel.findOne({
          chatGroup: Types.ObjectId(chatGroupId),
        }),
      ]);
      const participants = chatGroup.participants.map((i) => i.toString());
      if (!participants.includes(currentUser)) {
        throw new BadRequestException('you have not joined the chat group');
      }
      const chatId = recentChat.chat.toString();

      const query = this.chatModel
        .find({
          chatGroup: Types.ObjectId(chatGroupId),
        })
        .sort('-createdAt');
      const [inbox, _] = await Promise.all([
        paginate(query, { page: page, perPage: perPage }),
        this.chatModel.findByIdAndUpdate(chatId, {
          $addtoSet: { seenUsers: Types.ObjectId(currentUser) },
        }),
      ]);
      return {
        items: inbox.items.map((i) =>
          this.mapsHelper.mapToInboxOutput(currentUser, i),
        ),
        meta: inbox.meta,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
