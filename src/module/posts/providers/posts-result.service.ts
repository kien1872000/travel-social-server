import { PostOutput } from '@dto/post/post-new.dto';
import { Place } from '@entity/place.entity';
import { Post, PostDocument } from '@entity/post.entity';
import { MapsHelper } from '@helper/maps.helper';
import { LikesService } from '@like/providers/likes.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InterestType } from '@util/enums';
import { paginate } from '@util/paginate';
import { PaginationRes } from '@util/types';
import { Model, Types } from 'mongoose';
import { InterestsService } from 'src/module/interests/interests.service';
@Injectable()
export class PostsResultService {
  constructor(
    private readonly interestsService: InterestsService,
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    private readonly likesService: LikesService,
    private readonly mapsHelper: MapsHelper,
  ) {}
  public async getPostsResult(
    currentUser: string,
    page: number,
    perPage: number,
    interested = true,
    filter = {},
  ): Promise<PaginationRes<PostOutput>> {
    let [interestHastags, interestPlaces, interestUsers] = [[], [], []];
    if (interested) {
      [interestHastags, interestPlaces, interestUsers] = await Promise.all([
        this.interestsService.getInterests(currentUser, InterestType.Hashtag),
        this.interestsService.getInterests(currentUser, InterestType.Place),
        this.interestsService.getInterests(currentUser, InterestType.User),
      ]);
      // [interestHastags, interestPlaces, interestUsers] = await Promise.all([
      //   this.interestsService.getInterestsOfUser(currentUser, InterestType.Hashtag),
      //   this.interestsService.getInterestsOfUser(currentUser, InterestType.Place),
      //   this.interestsService.getInterestsOfUser(currentUser, InterestType.User),
      // ]);
    }

    let match = filter;
    if (
      !(
        interestHastags.length <= 0 ||
        interestPlaces.length <= 0 ||
        interestUsers.length <= 0
      )
    ) {
      match = {
        $and: [
          {
            $or: [
              { place: { $in: interestPlaces } },
              { user: { $in: interestUsers.map((i) => Types.ObjectId(i)) } },
              { hashtags: { $all: interestHastags } },
            ],
          },
          filter,
        ],
      };
    }

    const query = this.postModel
      .find(match)
      .populate('user', ['displayName', 'avatar'])
      .populate(
        'place',
        ['name', 'formattedAddress', 'coordinate', 'visits'],
        Place.name,
      )
      .select(['-mediaFiles._id'])
      .sort({ createdAt: -1 });
    const postsResult = await paginate<PostDocument>(query, {
      perPage: perPage,
      page: page,
    });
    return {
      items: await Promise.all(
        postsResult.items.map(async (i) => {
          const liked = await this.likesService.isUserLikedPost(
            currentUser,
            (i as any)._id.toString(),
          );
          return this.mapsHelper.mapToPostOutPut(i, currentUser, liked);
        }),
      ),
      meta: postsResult.meta,
    };
  }
}
