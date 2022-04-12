import { CreateChatGroupDto } from '@dto/chat/chat-group.dto';
import { ChatGroup, ChatGroupDocument } from '@entity/chat-group.entity';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
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
    { name, participants, isPrivate }: CreateChatGroupDto,
  ): Promise<void> {
    let image;
    console.log(participants);

    const allParticipants = [...new Set(participants), currentUser].map((i) =>
      Types.ObjectId(i),
    );

    if (allParticipants.length <= 1) return;
    if (isPrivate) {
      if (name || participants.length > 2) return;
      const query = {
        $and: [
          {
            participants: { $all: allParticipants },
          },
          { participants: { $size: allParticipants.length } },
          { isPrivate: true },
        ],
      };
      const isChatGroupExist = await this.chatGroupModel.findOne(query);

      if (isChatGroupExist)
        throw new BadRequestException('Chat group already exists');
      const userIds = participants.slice(0, 3);
      image = await this.usersService.getUserAvatars(userIds);
    } else {
      if (!name) return;
      const isChatGroupExist = await this.chatGroupModel.findOne({
        name: name.trim(),
      });
      if (isChatGroupExist)
        throw new BadRequestException('Chat group already exists');
      const userIds = [...new Set(participants), currentUser].slice(0, 3);
      image = await this.usersService.getUserAvatars(userIds);
    }
    const chatGroup = {
      image: image,
      name: name,
      participants: allParticipants,
      isPrivate: isPrivate,
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

      //update image for chat group
      await this.chatGroupModel.findByIdAndUpdate(chatGroupId, {
        image: image,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getParticipants(chatGroupId: string): Promise<string[]> {
    try {
      const chatGroup = await this.chatGroupModel.findById(chatGroupId);
      return chatGroup?.participants.map((i) => i.toString());
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
  public async getJoinedChatGroups(user: string): Promise<Types.ObjectId[]> {
    try {
      return (
        await this.chatGroupModel
          .find({ participants: Types.ObjectId(user) })
          .select('_id')
      ).map((i) => i._id);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
