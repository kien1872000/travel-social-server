import { FollowingsOutput } from '@dto/following/following.dto';
import { HashtagOutput } from '@dto/hashtag/hashtag.dto';

import { PostOutput } from '@dto/post/post-new.dto';
import { SearchUserDetailDto } from '@dto/user/search-user.dto';

import { PaginationRes } from '@util/types';

export class SearchDetailDto {
  users?: PaginationRes<SearchUserDetailDto>;
  posts?: PaginationRes<PostOutput>;
}
export class SearchDto {
  users?: PaginationRes<FollowingsOutput>;
  hashtags?: PaginationRes<HashtagOutput>;
}
