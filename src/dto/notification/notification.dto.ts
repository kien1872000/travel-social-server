import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class NotificationDto {
  @IsString()
  @IsNotEmpty()
  sender: string;
  @IsString()
  @IsNotEmpty()
  receiver: string;
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  postId?: string;
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  commentId?: string;
  @IsString()
  @IsNotEmpty()
  action: string;
}
export class NotificationMessage {
  sender: {
    _id: string;
    displayName: string;
    avatar: string;
  };
  action: string;
  postId?: string;
  commentId?: string;
  createdAt: Date;
  seen: boolean;
}
