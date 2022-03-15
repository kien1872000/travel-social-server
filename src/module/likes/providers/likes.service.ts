import { UserLike } from '@dto/like/like.dto';
import { Like, LikeDocument } from '@entity/like.entity';
import { UserDocument } from '@entity/user.entity';
import { FollowingsService } from '@following/providers/followings.service';
import { StringHandlersHelper } from '@helper/stringHandler.helper';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostsService } from '@post/providers/posts.service';
import { UsersService } from '@user/providers/users.service';
import { FOLLOWINGS_PER_PAGE } from '@util/constants';
import { Interaction } from '@util/enums';
import { Model, Types } from 'mongoose';

@Injectable()
export class LikesService {
  constructor(
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    private stringHandlersHelper: StringHandlersHelper,
    private postService: PostsService,
    private usersSerivce: UsersService,
    private followingService: FollowingsService,
  ) {}
  public async addLikeToPost(
    userId: string,
    postId: string,
  ): Promise<LikeDocument> {
    try {
      const checkPost = await this.postService.getPost(postId);
      if (!checkPost) {
        throw new BadRequestException('Post không tồn tại');
      }
      const checkIfReact = await this.likeModel.findOne({
        postId: Types.ObjectId(postId),
        userId: Types.ObjectId(userId),
      });
      if (!checkIfReact) {
        const like: Partial<LikeDocument> = {
          post: Types.ObjectId(postId),
          user: Types.ObjectId(userId),
        };
        const promises = await Promise.all([
          new this.likeModel(like).save(),
          this.postService.updateTotalPostCommentsOrLikes(
            postId,
            Interaction.Like,
            1,
          ),
        ]);
        return promises[0];
      }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async getLikesOfPost(
    userId: string,
    postId: string,
    pageNumber,
  ): Promise<UserLike[]> {
    try {
      const perPage = FOLLOWINGS_PER_PAGE;
      const skip = !pageNumber || pageNumber <= 0 ? 0 : pageNumber * perPage;
      const likes = await this.likeModel
        .find({ postId: Types.ObjectId(postId) })
        .populate('userId', ['displayName', 'avatar'])
        .select(['-_id', '-__v', '-createdAt', '-updatedAt', '-postId'])
        .skip(skip)
        .limit(perPage);
      const followedUsers = await this.followingService.getFollowingIds(userId);
      return likes.map((like) => {
        const user = like.user as any;
        return {
          userId: user._id,
          displayName: user.displayName,
          avatar: user?.avatar,
          isFollowed: followedUsers.includes(user._id.toString())
        }
      });
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  public async dislike(userId: string, postId: string): Promise<void> {
    try {
      const post = await this.postService.getPost(postId);
      if (!post) throw new BadRequestException('Post không tồn tại');
      const like = await this.likeModel.findOne({
        user: Types.ObjectId(userId),
        post: Types.ObjectId(postId),
      });
      if (like) {
        await Promise.all([
          this.likeModel.findByIdAndDelete(like._id),
          this.postService.updateTotalPostCommentsOrLikes(
            postId,
            Interaction.Like,
            -1,
          ),
        ]);
      }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  // public async getReactionStatisticByTime(
  //   userId: string,
  //   time: string,
  // ): Promise<StatisticOutPut[]> {
  //   try {
  //     const range = this.stringHandlersHelper.getStartAndEndDateWithTime(time);
  //     const postsToSearch = (
  //       await this.postService.getPostIdsInProfile(userId)
  //     ).map((postId) => Types.ObjectId(postId));
  //     const reactionsStatistic = await this.reactionModel.aggregate([
  //       {
  //         $match: {
  //           createdAt: { $gte: new Date(range[0]), $lte: new Date(range[1]) },
  //           postId: { $in: postsToSearch },
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: {
  //             year: { $year: { date: '$createdAt', timezone: VIET_NAM_TZ } },
  //             month: { $month: { date: '$createdAt', timezone: VIET_NAM_TZ } },
  //             day: {
  //               $dayOfMonth: { date: '$createdAt', timezone: VIET_NAM_TZ },
  //             },
  //           },
  //           date: { $first: '$createdAt' },
  //           scales: { $sum: 1 },
  //         },
  //       },
  //       {
  //         $sort: { date: 1 },
  //       },
  //       {
  //         $project: {
  //           date: 1,
  //           scales: 1,
  //           _id: 0,
  //         },
  //       },
  //     ]);

  //     const format = 'YYYY-MM-DD';
  //     return reactionsStatistic.map((i) => {
  //       const scales = (i as any).scales;
  //       const date = this.stringHandlersHelper.getDateWithTimezone(
  //         (i as any).date,
  //         VIET_NAM_TZ,
  //         format,
  //       );
  //       return {
  //         scales: scales,
  //         date: date,
  //       };
  //     });
  //   } catch (error) {
  //     console.log(error);

  //     throw new InternalServerErrorException(error);
  //   }
  // }
}
