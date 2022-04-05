import { User, UserDocument } from '@entity/user.entity';
import { FollowingsService } from '@following/providers/followings.service';
import { MapsHelper } from '@helper/maps.helper';
import { StringHandlersHelper } from '@helper/string-handler.helper';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { noResultPaginate } from '@util/paginate';
import { Model, Types } from 'mongoose';

@Injectable()
export class UsersSearchService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly mapsHelper: MapsHelper,
    private readonly stringHandlersHelper: StringHandlersHelper,
    private readonly followingsService: FollowingsService,
  ) {}
  public async getUserSearchList(
    search = '',
    page: number,
    perPage: number,
    currentUser: string,
  ) {
    search = this.stringHandlersHelper.removeAccent(search.trim());
    if (search.length <= 0) return noResultPaginate({ page, perPage });
    try {
      const globalRegex = new RegExp(
        '(^' + search + ')' + '|' + '( +' + search + '[a-zA-z]*' + ')',
        'i',
      );

      const query = await this.userModel.aggregate<UserDocument>([
        {
          $lookup: {
            from: 'followings',
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$user', Types.ObjectId(currentUser)] },
                },
              },
              { $project: { following: 1 } },
            ],
            as: 'followingList',
          },
        },
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$isActive', true] },
                { $in: ['$_id', '$followingList.following'] },
              ],
            },
          },
        },
        {
          $addFields: {
            followed: { $in: ['$_id', '$followingList.following'] },
          },
        },
        // { $sort: { followed: -1 } },
        { $project: { displayName: 1 } },
      ]);
      console.log(query.length);

      return query;
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException(error);
    }
  }
}
