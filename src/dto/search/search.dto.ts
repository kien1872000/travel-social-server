import { FollowingsOutput } from '@dto/following/following.dto';
import { HashtagDetailDto, HashtagOutput } from '@dto/hashtag/hashtag.dto';
import { DiscoveryPlacesDto } from '@dto/place/discovery.dto';
import { PlaceDetailDto, SearchPlaceDto } from '@dto/place/goong-map.dto';
import { PostOutput } from '@dto/post/post-new.dto';
import { SearchUserDetailDto } from '@dto/user/search-user.dto';
import { PlaceDocument } from '@entity/place.entity';
import { Address } from '@entity/user.entity';
import { PaginateOptions, PaginationRes } from '@util/types';

export class SearchDetailDto {
  users?: PaginationRes<SearchUserDetailDto>;
  posts?: PaginationRes<PostOutput>;
}
export class SearchDto {
  users?: PaginationRes<FollowingsOutput>;
  hashtags?: PaginationRes<HashtagOutput>;
}
