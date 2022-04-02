import { UpdatePlaceDto } from '@dto/place/place.dto';
import { Place } from '@entity/place.entity';
import { FileType } from '@entity/post.entity';
import { Address } from '@entity/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationRes } from '@util/types';
import { IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class PostInput extends UpdatePlaceDto {
  @ApiProperty({ type: String, description: 'description nếu có' })
  @IsString()
  description: string;
  @ApiProperty({ type: ['file'], description: 'image/video' })
  mediaFiles: Express.Multer.File[];
}

export class PostOutput {
  postId: string;
  userId: string;
  place: Place;
  userDisplayName: string;
  userAvatar: string;
  files: FileType[];
  liked: boolean;
  description: string;
  likes: number;
  comments: number;
  isCurrentUser: boolean;
  createdAt: string;
}
export class TrendingPostOutput {
  popular: number;
  posts: PaginationRes<PostOutput>;
}

