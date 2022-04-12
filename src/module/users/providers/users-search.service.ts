import { ChatGroupsService } from '@chat/providers/chat-groups.service';
import { User, UserDocument } from '@entity/user.entity';
import { FollowingsService } from '@following/providers/followings.service';
import { MapsHelper } from '@helper/maps.helper';
import { StringHandlersHelper } from '@helper/string-handler.helper';
import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SearchUserFilter } from '@util/enums';
import { noResultPaginate, paginate } from '@util/paginate';
import { Aggregate, Model, Types } from 'mongoose';

@Injectable()
export class UsersSearchService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly mapsHelper: MapsHelper,
    private readonly stringHandlersHelper: StringHandlersHelper,
    private readonly followingsService: FollowingsService,
    @Inject(forwardRef(() => ChatGroupsService))
    private readonly chatGroupService: ChatGroupsService,
  ) {}
  public async getUserSearchList(
    search = '',
    page: number,
    perPage: number,
    currentUser: string,
    filter: string,
    otherUser?: string,
    chatGroupId?: string,
  ) {
    try {
      search = this.stringHandlersHelper.removeAccent(search.trim());
      if (search.length <= 0) return noResultPaginate({ page, perPage });
      const globalRegex = new RegExp(
        '(^' + search + ')' + '|' + '( +' + search + '[a-zA-z]*' + ')',
        'i',
      );
      let target = otherUser ? otherUser : currentUser;
      let collection: string;
      let matchField: string;
      let selectField: any;
      const match: any = [
        { $eq: ['$isActive', true] },
        {
          $regexMatch: {
            input: '$displayNameNoAccent',
            regex: globalRegex,
          },
        },
      ];
      switch (filter) {
        case SearchUserFilter.ChatGroup:
          if (!chatGroupId) return;
          const chatGroup = await this.chatGroupService.getChatGroupById(
            chatGroupId,
          );
          if (!chatGroup) return;
          if (!chatGroup.participants.includes(Types.ObjectId(currentUser))) {
            throw new ForbiddenException('you have not joined the chat group');
          }
          target = chatGroupId;
          collection = 'chatgroups';
          matchField = '$_id';
          selectField = { participants: 1, _id: 0 };
          match.push({ $eq: ['$isInChatGroup', false] });
          break;
        case SearchUserFilter.Follower:
          collection = 'followings';
          matchField = '$following';
          selectField = { user: 1, _id: 0 };
          match.push({ $in: ['$_id', '$filterList.user'] });
          break;
        case SearchUserFilter.Following:
          collection = 'followings';
          matchField = '$user';
          selectField = { following: 1, _id: 0 };
          match.push({ $in: ['$_id', '$filterList.following'] });
          break;
        case SearchUserFilter.All:
          collection = 'followings';
        default:
          break;
      }
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
      const query = this.userModel.aggregate<UserDocument>([
        {
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
        },
      ]);
      if (filter !== SearchUserFilter.All) {
        query.append(filterList);
      }
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
      query.append(
        {
          $addFields: {
            followed: { $in: ['$_id', '$followingList.following'] },
          },
        },
        { $sort: { followed: -1 } },

        {
          $match: {
            $expr: {
              $and: match,
            },
          },
        },
      );
      const project = {
        userId: '$_id',
        displayName: 1,
        avatar: 1,
        followed: 1,
        isCurrentUser: { $eq: ['$_id', Types.ObjectId(currentUser)] },
      };
      return await paginate(query, { page, perPage }, project);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }
}
