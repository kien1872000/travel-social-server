import { ChatGroupsService } from '@chat/providers/chat-groups.service';
import { User, UserDocument } from '@entity/user.entity';
import { StringHandlersHelper } from '@helper/string-handler.helper';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InterestType, SearchUserFilter } from '@util/enums';
import { noResultPaginate, paginate } from '@util/paginate';
import { PaginationRes } from '@util/types';
import { Model, Types } from 'mongoose';
import { InterestsService } from 'src/module/interests/interests.service';

@Injectable()
export class UsersSearchService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly stringHandlersHelper: StringHandlersHelper,
    private readonly chatGroupService: ChatGroupsService,
    private readonly interestsService: InterestsService,
  ) {}
  public async getUserSearchList<T>(
    search = '',
    page: number,
    perPage: number,
    currentUser: string,
    moreInFo = false,
    filter?: string,
    target?: string,
  ): Promise<PaginationRes<T>> {
    try {
      search = this.stringHandlersHelper.removeAccent(search.trim());
      if (search.length <= 0) return noResultPaginate({ page, perPage });
      const globalRegex = new RegExp(
        '(^' + search + ')' + '|' + '( +' + search + '[a-zA-z]*' + ')',
        'i',
      );
      target = target ? target : currentUser;
      let collection: string;
      let matchField: string;
      let selectField: any;
      const searchMatch = {
        $match: {
          displayNameNoAccent: { $regex: globalRegex },
          isActive: true,
        },
      };
      let targetMatch;
      switch (filter) {
        case SearchUserFilter.ChatGroup:
          if (!target) return;
          const chatGroup = await this.chatGroupService.getChatGroupById(
            target,
          );
          if (!chatGroup)
            throw new BadRequestException('This chat group does not exist');
          if (!chatGroup.participants.includes(Types.ObjectId(currentUser))) {
            throw new ForbiddenException('you have not joined the chat group');
          }
          collection = 'chatgroups';
          matchField = '$_id';
          selectField = { participants: 1, _id: 0 };
          targetMatch = { $eq: ['$isInChatGroup', false] };
          break;
        case SearchUserFilter.Follower:
          collection = 'followings';
          matchField = '$following';
          selectField = { user: 1, _id: 0 };
          targetMatch = { $in: ['$_id', '$filterList.user'] };
          break;
        case SearchUserFilter.Following:
          collection = 'followings';
          matchField = '$user';
          selectField = { following: 1, _id: 0 };
          targetMatch = { $in: ['$_id', '$filterList.following'] };
          break;
        case SearchUserFilter.All:
        default:
          console.log(search);

          collection = 'followings';
          break;
      }
      const interestUsers = (
        await this.interestsService.getInterests(currentUser, InterestType.User)
      ).map((i) => Types.ObjectId(i));
      // const interestUsers = (
      //   await this.interestsService.getInterestsOfUser(currentUser, InterestType.User)
      // ).map((i) => Types.ObjectId(i));
      const filterList = {
        $lookup: {
          from: collection,
          pipeline: [
            {
              $match: {
                $expr: { $eq: [matchField, Types.ObjectId(target)] },
              },
            },
            { $project: selectField },
          ],
          as: 'filterList',
        },
      };
      const query = this.userModel.aggregate<UserDocument>([searchMatch]);
      const followingList = {
        $lookup: {
          from: 'followings',
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$user', Types.ObjectId(currentUser)] },
              },
            },
            { $project: { following: 1, _id: 0 } },
          ],
          as: 'followingList',
        },
      };

      if (filter && filter !== SearchUserFilter.All) {
        query.append(filterList);
        if (filter === SearchUserFilter.ChatGroup) {
          query.append({
            $addFields: {
              isInChatGroup: {
                $let: {
                  vars: {
                    filterList: { $arrayElemAt: ['$filterList', 0] },
                  },
                  in: { $in: ['$_id', '$$filterList.participants'] },
                },
              },
            },
          });
        }
        query.append({
          $match: { $expr: targetMatch },
        });
      }

      query.append(
        followingList,
        {
          $addFields: {
            followed: { $in: ['$_id', '$followingList.following'] },
          },
        },
        {
          $addFields: {
            interested: { $in: ['$_id', interestUsers] },
          },
        },
        { $sort: { interested: -1, followed: -1 } },
      );
      let project = {
        _id: 0,
        userId: '$_id',
        displayName: 1,
        avatar: 1,
        followed: 1,
        isCurrentUser: { $eq: ['$_id', Types.ObjectId(currentUser)] },
      };
      if (moreInFo) {
        project = {
          ...{ address: 1, followers: 1, followings: 1 },
          ...project,
        };
      }
      return (await paginate(
        query,
        { page, perPage },
        project,
      )) as unknown as PaginationRes<T>;
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException(error);
    }
  }
}
