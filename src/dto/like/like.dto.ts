import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { ReactionDocument } from 'src/entities/reaction.entity';

export class UserLike {
  userId: string;
  displayName: string;
  avatar: string;
  isFollowed: boolean;
}
