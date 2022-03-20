import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserCommentDto {
  commentId: string;
  comment: string;
  userId: string;
  displayName: string;
  avatar: string;
  replys: number;
  createdAt: Date;
}
export class AddCommentInput {
  @ApiProperty({ type: String, description: 'id của post muốn thêm comment' })
  @IsString()
  @IsNotEmpty()
  postId: string;
  @ApiProperty({ type: String, description: 'Nội dung comment' })
  @IsString()
  @IsNotEmpty()
  comment: string;
}
export class AddReplyInput {
  @ApiProperty({ type: String, description: 'id của comment muốn thêm reply' })
  @IsString()
  @IsNotEmpty()
  commentId: string;
  @ApiProperty({ type: String, description: 'Nội dung comment' })
  @IsString()
  @IsNotEmpty()
  comment: string;
}

export class DeleteCommentInput {
  @ApiProperty({ type: String, description: 'id của comment muốn xóa' })
  @IsString()
  @IsNotEmpty()
  commentId: string;
}
