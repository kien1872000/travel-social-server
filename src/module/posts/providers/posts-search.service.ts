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
      let query;
      if (hashtagsArr?.length === 1) {
        const hashtagInfo = await this.hashtagsService.getHashtag(
          hashtagsArr[0],
        );
        if (hashtagInfo) {
          console.log(hashtagInfo);

          query = this.postModel
            .find({
              hashtags: hashtagsArr[0],
            })
            .populate('user', ['avatar', 'displayName'])
            .select(['-__v']);
        }
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
      search = search?.trim();
      if (!search || search.length <= 0) {
        return noResultPaginate({ page, perPage });
      }
      const hashtagsInsearch =
        this.stringHandlersHelper.getHashtagFromString(search);
      let rmwp = search.split(' ').join('');
      hashtagsInsearch.forEach((ht) => {
        rmwp = rmwp.replace(ht, '');
      });
      console.log(rmwp);

      if (hashtagsInsearch?.length > 0 && rmwp.length === 0) {
        return await this.searchPostByHashtags(
          hashtagsInsearch,
          page,
          perPage,
          currentUser,
        );
      } else {
        console.log(search);
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
