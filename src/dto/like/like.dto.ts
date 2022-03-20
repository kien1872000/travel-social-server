import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserLike {
  userId: string;
  displayName: string;
  avatar: string;
  isFollowed: boolean;
}
export class LikeInput {
  @ApiProperty({ type: String, description: 'id của post muốn thêm like' })
  @IsString()
  @IsNotEmpty()
  postId: string;
}
