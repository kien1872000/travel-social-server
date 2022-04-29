import { PostOutput } from '@dto/post/post-new.dto';
import { Post, PostDocument } from '@entity/post.entity';

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { PaginationRes } from '@util/types';
import { Model } from 'mongoose';
import { PostsResultService } from './posts-result.service';

@Injectable()
export class PostPlaceService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    private readonly postsResultService: PostsResultService,
  ) {}
  public async getNumberOfRelatedPosts(placeId: string): Promise<number> {
    try {
      return await this.postModel.countDocuments({ place: placeId });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getDiscoveryPosts(
    placeId: string,
    page: number,
    perPage: number,
    currentUser: string,
  ): Promise<PaginationRes<PostOutput>> {
    try {
      const match = { place: placeId };

      return await this.postsResultService.getPostsResult(
        currentUser,
        page,
        perPage,
        false,
        match,
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getMostLikesPost(placeId: string): Promise<PostDocument> {
    try {
      const posts = await this.postModel
        .find({ place: placeId })
        .sort('-likes')
        .limit(1);
      return posts[0];
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
