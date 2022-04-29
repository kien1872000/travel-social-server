import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FollowingsOutput } from '@dto/following/following.dto';
import { Following, FollowingDocument } from '@entity/following.entity';
import { MapsHelper } from '@helper/maps.helper';

import { PaginationRes } from '@util/types';
import { paginate } from '@util/paginate';
import { User, UserDocument } from '@entity/user.entity';

@Injectable()
export class FollowingsService {
  constructor(
    @InjectModel(Following.name)
    private followingModel: Model<FollowingDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private mapsHelper: MapsHelper,
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
          this.updateFollowers(followingId, 1),
          this.updateFollowings(userId, 1),
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
  private async updateFollowings(
    userId: string,
    update: number,
  ): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(userId, {
        $inc: { followings: update },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  private async updateFollowers(userId: string, update: number): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(userId, {
        $inc: { followers: update },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async unFollow(userId: string, followingId: string): Promise<void> {
    try {
      followingId = followingId.trim();
      if (userId === followingId) return;
      const followingDelete = await this.followingModel.findOneAndDelete({
        user: Types.ObjectId(userId),
        following: Types.ObjectId(followingId),
      });
      if (!followingDelete) {
        throw new BadRequestException("You haven't followed this person yet");
      }

      await Promise.all([
        this.updateFollowers(followingId, -1),
        this.updateFollowings(userId, -1),
      ]);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getFollowings(
    userId: string,
    page: number,
    perPage: number,
    currentUser: string,
  ): Promise<PaginationRes<FollowingsOutput>> {
    try {
      const query = this.followingModel
        .find({
          user: new Types.ObjectId(userId),
        })
        .populate('following', ['displayName', 'avatar'])
        .select(['-_id', '-__v']);
      const [followings, followingIds] = await Promise.all([
        paginate(query, { perPage: perPage, page: page }),
        this.getFollowingIds(currentUser),
      ]);
      return {
        items: this.mapsHelper.mapToFollowingsOuput(
          followings.items,
          followingIds,
          currentUser,
        ),
        meta: followings.meta,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getFollowers(
    userId: string,
    page: number,
    perPage: number,
    currentUser: string,
  ): Promise<PaginationRes<FollowingsOutput>> {
    try {
      userId = userId.trim();
      const query = this.followingModel
        .find({
          following: new Types.ObjectId(userId),
        })
        .populate('user', ['displayName', 'avatar'])
        .select(['-_id', '-__v']);
      const [followers, followingIds] = await Promise.all([
        paginate(query, { perPage: perPage, page: page }),
        this.getFollowingIds(currentUser),
      ]);
      return {
        items: this.mapsHelper.mapToFollowingsOuput(
          followers.items,
          followingIds,
          currentUser,
        ),
        meta: followers.meta,
      };
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
