import { Address } from '@entity/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Express } from 'express';
export class UserInfoInput {
  @ApiProperty({
    type: String,
    required: false,
    description: 'Tên hiển thị, chỉ được đổi sau 30 ngày',
  })
  displayName: string;
  @ApiProperty({
    type: String,
    required: false,
    description: 'bio',
  })
  bio: string;
  @ApiProperty({
    type: String,
    required: false,
    description: 'Ngày tháng năm sinh theo dạng DateString, bắt buộc',
  })
  @IsDateString()
  birthday: string;
  @ApiProperty({
    type: Number,
    required: true,
    description: 'Giới tính 0: nữ, 1: nam, 2: khác',
  })
  @IsInt()
  @IsIn([0, 1, 2])
  sex: number;
}

export interface UserProfile {
  email: string;
  displayName: string;
  renamableTime: Date;
  birthday: string;
  avatar: string;
  coverPhoto: string;
  address: Address;
  sex: string;
  bio: string;
  sexNumber: number;
  followers: number;
  followings: number;
  isCurrentUser: boolean;
  isFollowed?: boolean;
  createdAt: string;
}
export class ProfileImageInput {
  @ApiProperty({
    type: 'file',
    required: false,
    description: 'file ảnh đại diện, nhớ bỏ check send empty value',
  })
  avatar: Express.Multer.File;
  @ApiProperty({
    type: 'file',
    required: false,
    description: 'file ảnh bìa, nhớ bỏ check send empty value',
  })
  coverPhoto: Express.Multer.File;
}
export class ProfileImageOutPut {
  avatar: string;
  coverPhoto: string;
}
