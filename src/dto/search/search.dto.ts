import { FollowingsOutput } from '@dto/following/following.dto';
import { HashtagDetailDto } from '@dto/hashtag/hashtag.dto';
import { DiscoveryPlacesDto } from '@dto/place/discovery.dto';
import { PlaceDetailDto, SearchPlaceDto } from '@dto/place/goong-map.dto';
import { PostOutput } from '@dto/post/post-new.dto';
import { SearchUserDto } from '@dto/user/search-user.dto';
import { PlaceDocument } from '@entity/place.entity';
import { PaginationRes } from '@util/types';

export class SearchDetailDto {
  users: PaginationRes<SearchUserDto>;
  posts: PaginationRes<PostOutput>;
}
export class SearchDto {
  result:
    | PaginationRes<FollowingsOutput>
    | PaginationRes<Partial<PlaceDocument>>
    | PaginationRes<HashtagDetailDto>
}
