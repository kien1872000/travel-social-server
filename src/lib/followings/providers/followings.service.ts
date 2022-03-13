import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FollowingsOutput } from 'src/dto/following/following.dto';
import { Following, FollowingDocument } from 'src/entity/following.entity';
import { MapsHelper } from 'src/helper/maps.helper';
import { UsersService } from 'src/lib/users/providers/users.service';
import { FOLLOWERS_PER_PAGE, FOLLOWINGS_PER_PAGE } from 'src/util/constants';

@Injectable()
export class FollowingsService {
  constructor(
    @InjectModel(Following.name)
    private followingModel: Model<FollowingDocument>,
    private mapsHelper: MapsHelper,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
  ) {}
  public async checkIfFollowed(userId, followingId) {
    try {
      return this.followingModel.findOne({
        user: new Types.ObjectId(userId),
        following: new Types.ObjectId(followingId),
      });
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  public async addFollowing(
    userId: string,
    followingId: string,
  ): Promise<void> {
    try {
      followingId = followingId.trim();
      if (userId === followingId) return;
      const following = await this.followingModel.findOne({
        user: new Types.ObjectId(userId),
        following: new Types.ObjectId(followingId),
      });
      if (following) {
        throw new BadRequestException('You have been following this user');
      }
      if (userId.toString() !== followingId) {
        await Promise.all([
          this.usersService.updateFollowers(new Types.ObjectId(followingId), 1),
          this.usersService.updateFollowings(new Types.ObjectId(userId), 1),
          new this.followingModel({
            user: new Types.ObjectId(userId),
            following: new Types.ObjectId(followingId),
          }).save(),
        ]);
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async unFollow(userId: string, followingId: string): Promise<void> {
    try {
      followingId = followingId.trim();
      if (userId === followingId) return;
      const followingDelete = await this.followingModel.findOneAndDelete({
        user: new Types.ObjectId(userId),
        following: new Types.ObjectId(followingId),
      });
      if (!followingDelete) {
        throw new BadRequestException("You haven't followed this person yet");
      }

      await Promise.all([
        this.usersService.updateFollowers(new Types.ObjectId(followingId), -1),
        this.usersService.updateFollowings(new Types.ObjectId(userId), -1),
      ]);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getFollowings(
    userId: string,
    pageNumber: number,
    currentUserId: string,
  ): Promise<FollowingsOutput[]> {
    userId = userId.trim();
    let followings: FollowingDocument[];
    let followingsIds: string[];
    const perPage = FOLLOWINGS_PER_PAGE;
    const skip = !pageNumber || pageNumber <= 0 ? 0 : pageNumber * perPage;
    if (userId !== currentUserId) {
      const promises = await Promise.all([
        this.followingModel
          .find({
            user: new Types.ObjectId(userId),
          })
          .populate('following', ['displayName', 'avatar'])
          .select(['-_id', '-__v'])
          .skip(skip)
          .limit(perPage),
        this.getFollowingIds(currentUserId),
      ]);
      followings = promises[0];
      followingsIds = promises[1];
    } else {
      followings = await this.followingModel
        .find({
          user: new Types.ObjectId(userId),
        })
        .populate('following', ['displayName', 'avatar'])
        .select(['-_id', '-__v'])
        .skip(skip)
        .limit(perPage);
    }
    // console.log(followings);
    return followings.map((i) => {
      const user = i.following as unknown as any;
      let followed = true;
      if (userId !== currentUserId) {
        followed = followingsIds.includes(user._id.toString());
      }
      return {
        userId: user._id.toString(),
        displayName: user.displayName,
        avatar: user.avatar,
        followed: followed,
        isCurrentUser: currentUserId === user._id.toString(),
      };
    });
  }
  public async getFollowers(
    userId: string,
    pageNumber: number,
    currentUserId: string,
  ): Promise<FollowingsOutput[]> {
    try {
      userId = userId.trim();
      const perPage = FOLLOWERS_PER_PAGE;
      const skip = !pageNumber || pageNumber <= 0 ? 0 : pageNumber * perPage;
      const promises = await Promise.all([
        this.followingModel
          .find({
            following: new Types.ObjectId(userId),
          })
          .populate('user', ['displayName', 'avatar'])
          .select(['-_id', '-__v'])
          .skip(skip)
          .limit(perPage),
        this.getFollowingIds(currentUserId),
      ]);
      const followings = promises[0];
      // console.log(followings);
      const followingIds = promises[1];
      // console.log(followingIds);
      return this.mapsHelper.mapToFollowingsOuput(
        followings,
        followingIds,
        currentUserId,
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getFollowingIds(
    userId: string,
    followerIds?: Types.ObjectId[],
  ): Promise<string[]> {
    let followings;
    if (!followerIds) {
      followings = await this.followingModel
        .find({
          user: new Types.ObjectId(userId),
        })
        .select(['following', '-_id']);
    } else {
      followings = await this.followingModel
        .find({
          user: new Types.ObjectId(userId),
          following: { $in: followerIds },
        })
        .select(['following']);
    }
    return followings.map((i) => i.following.toString());
  }
}
