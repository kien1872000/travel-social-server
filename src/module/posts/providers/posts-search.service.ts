import { PostOutput } from '@dto/post/post-new.dto';
import { Post, PostDocument } from '@entity/post.entity';
import { HashtagsService } from '@hashtag/hashtags.service';
import { MapsHelper } from '@helper/maps.helper';
import { StringHandlersHelper } from '@helper/string-handler.helper';
import { LikesService } from '@like/providers/likes.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { noResultPaginate, paginate } from '@util/paginate';
import { PaginationRes } from '@util/types';
import { Model } from 'mongoose';

@Injectable()
export class PostsSearchService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    private readonly stringHandlersHelper: StringHandlersHelper,
    private readonly hashtagsService: HashtagsService,
    private readonly likesService: LikesService,
    private readonly mapsHelper: MapsHelper,
  ) {}
  public async searchPostByHashtags(
    hashtagsArr: string[],
    page: number,
    perPage: number,
    currentUser: string,
  ): Promise<PaginationRes<PostOutput>> {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-types
      let query;
      if (hashtagsArr?.length === 1) {
        const hashtagInfo = await this.hashtagsService.searchHashtags(
          hashtagsArr[0],
          0,
          1,
        );
        if (hashtagInfo.items[0]) {
          query = this.postModel
            .find({
              hashtags: hashtagInfo.items[0].hashtag,
            })
            .populate('user', ['avatar', 'displayName'])
            .select(['-__v']);
        } else return noResultPaginate({ page, perPage });
      } else {
        query = this.postModel
          .find({
            hashtags: { $all: hashtagsArr },
          })
          .populate('user', ['avatar', 'displayName'])
          .select(['-__v']);
      }
      const posts = await paginate(query, { page, perPage });
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
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  public async searchPosts(
    currentUser: string,
    search: string,
    page: number,
    perPage: number,
  ): Promise<PaginationRes<PostOutput>> {
    try {
      const hashtagsInsearch =
        this.stringHandlersHelper.getHashtagFromString(search);
      const tempHashtags = hashtagsInsearch.map((ht) => ht.replace('#', ''));
      let removeNonHashtagCharacters = this.stringHandlersHelper
        .removeAccent(search)
        .split(/[^a-z0-9]/)
        .join('');
      tempHashtags.forEach((ht) => {
        removeNonHashtagCharacters = removeNonHashtagCharacters.replace(ht, '');
      });

      if (
        hashtagsInsearch?.length > 0 &&
        removeNonHashtagCharacters.length <= 0
      ) {
        return await this.searchPostByHashtags(
          hashtagsInsearch,
          page,
          perPage,
          currentUser,
        );
      } else {
        const query = this.postModel
          .find({ $text: { $search: search } })
          .populate('user', ['avatar', 'displayName'])
          .select(['-__v']);
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
      }
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException(error);
    }
  }
}
