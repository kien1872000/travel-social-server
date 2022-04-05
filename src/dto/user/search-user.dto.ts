import { FollowingsOutput } from '@dto/following/following.dto';
import { Address } from '@entity/user.entity';

export class SearchUserDto extends FollowingsOutput {
  address: Address;
}
