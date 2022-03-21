import { PostDetail } from '@dto/post/post-detail.dto';
import { UserProfile } from '@dto/user/userProfile.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class NotificationDetailInput {
  @IsString()
  @IsNotEmpty()
  notificationId: string;
}
export class NotificationDetailOutput {
  action: string;
  data: UserProfile | PostDetail;
}
