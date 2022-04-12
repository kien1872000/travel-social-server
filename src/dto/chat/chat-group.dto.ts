import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateChatGroupDto {
  @ApiProperty({
    type: String,
    required: false,
    description: 'Tên của group chat, nếu nhắn tin riêng thì bỏ qua',
  })
  @IsNotEmpty()
  @IsOptional()
  name: string;
  @ApiProperty({
    type: [String],
    required: true,
    description: 'Các thành viên tham gia, không bao gồm user hiện tại',
  })
  @IsString({ each: true })
  @ArrayNotEmpty()
  participants: string[];
  @ApiProperty({
    type: Boolean,
    required: true,
    description: 'biến để check xem có phải là group hay chat riêng',
  })
  isPrivate: boolean;
}
