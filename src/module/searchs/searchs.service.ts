import { FollowingsOutput } from '@dto/following/following.dto';
import { SearchDetailDto, SearchDto } from '@dto/search/search.dto';
import { SearchUserDetailDto } from '@dto/user/search-user.dto';
import { HashtagsService } from '@hashtag/hashtags.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PostsSearchService } from '@post/providers/posts-search.service';
import { UsersSearchService } from '@user/providers/users-search.service';
import { SearchAllDetailFilter, SearchUserFilter } from '@util/enums';
import { noResultPaginate } from '@util/paginate';
import { PlacesService } from '../places/providers/places.service';

@Injectable()
export class SearchsService {
  constructor(
    private readonly hashtagsService: HashtagsService,
    private readonly placesService: PlacesService,
    private readonly postsSearchService: PostsSearchService,
    private readonly usersSearchService: UsersSearchService,
  ) {}
  public async searchAll(
    input: string,
    page: number,
    perPage: number,
    currentUser: string,
  ): Promise<SearchDto> {
    input = input?.trim();
    if (!input || input.length <= 0)
      return { users: noResultPaginate({ page, perPage }) };
    if (input[0] !== '#') {
      const users =
        await this.usersSearchService.getUserSearchList<FollowingsOutput>(
          input,
          page,
          perPage,
          currentUser,
        );
      return { users };
    } else {
      const temp = input.toLowerCase().replace(/[^a-z0-9]/g, ' ');
      input = ['#', ...temp.split(' ')].join('');
      console.log(input);

      const hashtags = await this.hashtagsService.searchHashtags(
        input,
        page,
        perPage,
        currentUser,
      );
      return { hashtags };
    }
  }
  public async searchAllDetail(
    input: string,
    filter: string,
    page: number,
    perPage: number,
    currentUser: string,
  ): Promise<SearchDetailDto> {
    try {
      input = input?.trim();
      if (!input || input.length <= 0) {
        return { users: noResultPaginate({ page, perPage }) };
      }
      switch (filter) {
        case SearchAllDetailFilter.User:
          const users =
            await this.usersSearchService.getUserSearchList<SearchUserDetailDto>(
              input,
              page,
              perPage,
              currentUser,
              true,
              SearchUserFilter.All,
            );
          return { users };
        case SearchAllDetailFilter.Post:
        default:
          const posts = await this.postsSearchService.searchPosts(
            currentUser,
            input,
            page,
            perPage,
          );
          return { posts };
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
