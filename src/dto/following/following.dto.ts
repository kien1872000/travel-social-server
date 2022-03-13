import { ApiProperty } from '@nestjs/swagger';

export class FollowingInput {
  @ApiProperty({
    type: String,
    required: true,
    description: 'Id của người muốn bỏ theo dõi hoặc muốn theo dõi',
  })
  followingId: string;
}

export class FollowingsOutput {
  userId: string;
  displayName: string;
  avatar: string;
  followed: boolean;
  isCurrentUser: boolean;
}

