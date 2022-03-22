import { PostDetail } from '@dto/post/post-detail.dto';
import { UserProfile } from '@dto/user/userProfile.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class NotificationDetailInput {
  @ApiProperty({
    type: String,
    description: 'id của notification muốn xem detail',
  })
  @IsString()
  @IsNotEmpty()
  notificationId: string;
}
export class NotificationDetailOutput {
  action: string;
  data: UserProfile | PostDetail;
}
