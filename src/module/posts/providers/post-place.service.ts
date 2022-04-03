import { PostOutput } from '@dto/post/post-new.dto';
import { Place } from '@entity/place.entity';
import { Post, PostDocument } from '@entity/post.entity';
import { MapsHelper } from '@helper/maps.helper';
import { LikesService } from '@like/providers/likes.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { paginate } from '@util/paginate';
import { PaginationRes } from '@util/types';
import { Model } from 'mongoose';

@Injectable()
export class PostPlaceService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    private readonly mapsHelper: MapsHelper,
    private readonly likesService: LikesService,
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
      const query = this.postModel
        .find({ place: placeId })
        .populate('user', ['displayName', 'avatar'])
        .populate(
          'place',
          ['name', 'formattedAddress', 'coordinate', 'visits'],
          Place.name,
        )
        .select(['-mediaFiles._id']);
      const posts = await paginate(query, { page: page, perPage: perPage });
      return {
        items: await Promise.all(
          posts.items.map(async (i) => {
            const liked = await this.likesService.isUserLikedPost(
              currentUser,
              (i as any)._id.toString(),
            );
            return this.mapsHelper.mapToPostOutPut(i, currentUser, liked);
          }),
        ),
        meta: posts.meta,
      };
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
