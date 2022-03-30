import { CreateChatGroupDto } from '@dto/chat/chat-group.dto';
import { ChatGroup, ChatGroupDocument } from '@entity/chat-group.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UsersService } from '@user/providers/users.service';
import { Model, Types } from 'mongoose';

@Injectable()
export class ChatGroupsService {
  constructor(
    @InjectModel(ChatGroup.name)
    private readonly chatGroupModel: Model<ChatGroupDocument>,
    private readonly usersService: UsersService,
  ) {}
  public async createChatGroup(
    currentUser: string,
    createChatGroupDto: CreateChatGroupDto,
  ): Promise<void> {
    let image;
    if (createChatGroupDto.participants.length < 1) return;
    if (createChatGroupDto.isPrivate) {
      if (createChatGroupDto.name || createChatGroupDto.participants.length > 1)
        return;
      const query = {
        participants: createChatGroupDto.participants.map((i) =>
          Types.ObjectId(i),
        ),
        isPrivate: true,
      };
      const isChatGroupExist = (await this.chatGroupModel.findOne(query))
        ? true
        : false;
      if (isChatGroupExist) return;
    } else {
      if (!createChatGroupDto.name) return;
      const userIds = createChatGroupDto.participants.slice(0, 3);
      image = await this.usersService.getUserAvatars(userIds);
    }
    const chatGroup = {
      image: image,
      name: createChatGroupDto.name,
      participants: [
        ...new Set(createChatGroupDto.participants),
        currentUser,
      ].map((i) => Types.ObjectId(i)),
      isPrivate: createChatGroupDto.isPrivate,
    };
    await new this.chatGroupModel(chatGroup).save();
    try {
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async addUsersToChatGroup(
    userIds: string[],
    chatGroupId: string,
  ): Promise<void> {
    try {
      const userObjectIds = userIds.map((i) => Types.ObjectId(i));
      const chatGroup = await this.chatGroupModel.findByIdAndUpdate(
        chatGroupId,
        {
          $push: { participants: { $each: userObjectIds } },
        },
        { new: true },
      );
      const participants = chatGroup.participants
        .map((i) => i.toString())
        .slice(0, 3);
      const image = await this.usersService.getUserAvatars(participants);
      await this.chatGroupModel.findByIdAndUpdate(
        { chatGroupId },
        { image: image },
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getParticipants(chatGroupId: string): Promise<string[]> {
    try {
      const chatGroup = await this.chatGroupModel.findById(chatGroupId);
      return chatGroup.participants.map((i) => i.toString());
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getChatGroupById(
    chatGoupId: string,
  ): Promise<ChatGroupDocument> {
    try {
      return await this.chatGroupModel.findById(chatGoupId);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async removeUser(userId: string, chatGroupId: string): Promise<void> {
    try {
      await this.chatGroupModel.findByIdAndUpdate(chatGroupId, {
        $pull: { participants: { _id: Types.ObjectId(userId) } },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async leaveChatGroup(
    userId: string,
    chatGroupId: string,
  ): Promise<void> {
    try {
      const chatGroup = await this.chatGroupModel.findById(chatGroupId);
      const newParticipants = chatGroup.participants.filter(
        (i) => i.toString() !== userId,
      );
      const image = await this.usersService.getUserAvatars(
        newParticipants.map((i) => i.toString()),
      );
      if (chatGroup.participants.length <= 1) {
        await this.chatGroupModel.findByIdAndDelete(chatGroupId);
      } else {
        await this.chatGroupModel.findByIdAndUpdate(chatGroupId, {
          participants: newParticipants,
          image: image,
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
