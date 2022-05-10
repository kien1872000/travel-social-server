import { UserLike } from '@dto/like/like.dto';
import { Like, LikeDocument } from '@entity/like.entity';
import { Post, PostDocument } from '@entity/post.entity';
import { FollowingsService } from '@following/providers/followings.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { paginate } from '@util/paginate';
import { PaginationRes } from '@util/types';
import { Model, Types } from 'mongoose';

@Injectable()
export class LikesService {
  constructor(
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,

    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,

    private followingService: FollowingsService,
  ) {}
  public async addLikeToPost(
    userId: string,
    postId: string,
  ): Promise<LikeDocument> {
    try {
      const checkPost = await this.postModel.findById(postId);
      if (!checkPost) {
        throw new BadRequestException('Post không tồn tại');
      }
      const checkIfReact = await this.likeModel.findOne({
        post: Types.ObjectId(postId),
        user: Types.ObjectId(userId),
      });
      if (!checkIfReact) {
        const like: Partial<LikeDocument> = {
          post: Types.ObjectId(postId),
          user: Types.ObjectId(userId),
        };
        const [newLike] = await Promise.all([
          new this.likeModel(like).save(),
          this.updateTotalPostLikes(postId, 1),
        ]);
        return newLike;
      }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async getLikesOfPost(
    userId: string,
    postId: string,
    page: number,
    perPage: number,
  ): Promise<PaginationRes<UserLike>> {
    try {
      const query = this.likeModel
        .find({ post: Types.ObjectId(postId) })
        .populate('user', ['displayName', 'avatar'])
        .select(['-_id', '-__v', '-createdAt', '-updatedAt', '-postId']);
      const followedUsers = await this.followingService.getFollowingIds(userId);
      const likes = await paginate(query, { page: page, perPage: perPage });

      return {
        items: likes.items.map((like) => {
          const user = like.user as any;
          return {
            userId: user._id,
            displayName: user.displayName,
            avatar: user?.avatar,
            isFollowed: followedUsers.includes(user._id.toString()),
          };
        }),
        meta: likes.meta,
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  public async removeLike(userId: string, postId: string): Promise<void> {
    try {
      const post = await this.postModel.findById(postId);
      if (!post) throw new BadRequestException('Post không tồn tại');
      const like = await this.likeModel.findOne({
        user: Types.ObjectId(userId),
        post: Types.ObjectId(postId),
      });
      if (like) {
        await Promise.all([
          this.likeModel.findByIdAndDelete(like._id),
          this.updateTotalPostLikes(postId, -1),
        ]);
      }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  private async updateTotalPostLikes(
    postId: string,
    count: number,
  ): Promise<void> {
    try {
      const update = { $inc: { likes: count } };
      await this.postModel.findByIdAndUpdate(postId, update);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  public async isUserLikedPost(
    userId: string,
    postId: string,
  ): Promise<boolean> {
    try {
      const like = await this.likeModel.findOne({
        user: Types.ObjectId(userId),
        post: Types.ObjectId(postId),
      });
      return like ? true : false;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getUsersInteracLike(currentUser: string): Promise<number> {
    try {
      return await this.likeModel
        .find({ user: Types.ObjectId(currentUser) })
        .count();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
