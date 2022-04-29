import { PostOutput } from '@dto/post/post-new.dto';
import { HashtagsService } from '@hashtag/hashtags.service';
import { StringHandlersHelper } from '@helper/string-handler.helper';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { noResultPaginate } from '@util/paginate';
import { PaginationRes } from '@util/types';
import { PostsResultService } from './posts-result.service';

@Injectable()
export class PostsSearchService {
  constructor(
    private readonly stringHandlersHelper: StringHandlersHelper,
    private readonly postsResultService: PostsResultService,
    private readonly hashtagsService: HashtagsService,
  ) {}
  public async searchPostByHashtags(
    hashtagsArr: string[],
    page: number,
    perPage: number,
    currentUser: string,
  ): Promise<PaginationRes<PostOutput>> {
    try {
      let match;
      if (hashtagsArr?.length === 1) {
        const hashtagInfo = await this.hashtagsService.searchHashtags(
          hashtagsArr[0],
          0,
          1,
          currentUser,
        );
        if (hashtagInfo.items[0]) {
          match = { hashtags: hashtagInfo.items[0].hashtag };
        } else return noResultPaginate({ page, perPage });
      } else {
        match = { hashtags: { $all: hashtagsArr } };
      }
      return await this.postsResultService.getPostsResult(
        currentUser,
        page,
        perPage,
        match,
      );
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
        const match = { $text: { $search: search } };
        return await this.postsResultService.getPostsResult(
          currentUser,
          page,
          perPage,
          match,
        );
      }
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException(error);
    }
  }
}
