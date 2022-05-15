import { ChatGroupOutput, CreateChatGroupDto } from '@dto/chat/chat-group.dto';
import { ChatGroup, ChatGroupDocument } from '@entity/chat-group.entity';
import { MapsHelper } from '@helper/maps.helper';
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
    private readonly mapsHelper: MapsHelper,
  ) {}
  public async createChatGroup(
    currentUser: string,
    { name, participants, isPrivate }: CreateChatGroupDto,
  ): Promise<ChatGroupOutput> {
    try {
      let image;
      const allParticipants = [...new Set(participants), currentUser].map((i) =>
        Types.ObjectId(i),
      );

      if (allParticipants.length <= 1) return;

      let chatGroupName = [name];
      if (isPrivate) {
        if (name || allParticipants.length > 2) return;
        const query = {
          $and: [
            {
              participants: { $all: allParticipants },
            },
            { participants: { $size: allParticipants.length } },
            { isPrivate: true },
          ],
        };
        const chatGroup = await this.chatGroupModel.findOne(query);

        if (chatGroup)
          return this.mapsHelper.mapToChatGroupOutput(currentUser, chatGroup);
        const [user, partner] = await Promise.all([
          this.usersService.findUserById(currentUser),
          this.usersService.findUserById(participants[0]),
        ]);
        chatGroupName = [
          currentUser,
          user.displayName,
          (partner as any)._id.toString(),
          partner.displayName,
        ];
        image = [
          currentUser,
          user.avatar,
          (partner as any)._id.toString(),
          partner.avatar,
        ];
      } else {
        if (!name) return;
        // const isChatGroupExist = await this.chatGroupModel.findOne({
        //   name: name.trim(),
        // });
        // if (isChatGroupExist)
        //   throw new BadRequestException('Chat group name already exists');
        const userIds = [...new Set(participants), currentUser].slice(0, 3);
        image = await this.usersService.getUserAvatars(userIds);
      }
      const chatGroup = {
        image: image,
        name: chatGroupName,
        participants: allParticipants,
        isPrivate: isPrivate,
      };
      return this.mapsHelper.mapToChatGroupOutput(
        currentUser,
        await new this.chatGroupModel(chatGroup).save(),
      );
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException(error);
    }
  }
  public async addUsersToChatGroup(
    userIds: string[],
    chatGroupId: string,
    currentUser: string,
  ): Promise<ChatGroupOutput> {
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
      const name = [`you and ${chatGroup.participants.length - 1} more people`];

      //update image for chat group
      const newChatGroup = await this.chatGroupModel
        .findByIdAndUpdate(
          chatGroupId,
          {
            image: image,
            name: name,
          },
          { new: true },
        )
        .select('-participants');
      return this.mapsHelper.mapToChatGroupOutput(currentUser, newChatGroup);
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
  ): Promise<ChatGroupOutput> {
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
        return null;
      } else {
        const name = [`you and ${newParticipants.length - 1} more people`];

        const newChatGroup = await this.chatGroupModel.findByIdAndUpdate(
          chatGroupId,
          {
            name: name,
            participants: newParticipants,
            image: image,
          },
          {
            new: true,
          },
        );
        return this.mapsHelper.mapToChatGroupOutput(userId, newChatGroup);
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
