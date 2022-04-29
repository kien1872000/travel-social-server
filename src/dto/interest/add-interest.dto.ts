import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddInterestDto {
  @ApiProperty({ type: String, description: 'id của post' })
  @IsString()
  @IsNotEmpty()
  postId: string;
}
