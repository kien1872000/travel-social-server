import { FollowingsOutput } from '@dto/following/following.dto';
import { Address } from '@entity/user.entity';

export class SearchUserDetailDto extends FollowingsOutput {
  followers: number;
  followings: number;
  address: Address
}