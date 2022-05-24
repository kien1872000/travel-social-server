import { ApiProperty } from '@nestjs/swagger';
import { PASSWORD_REGEX } from '@util/constants';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ChangePasswordInput {
  @ApiProperty({
    type: String,
    required: true,
    description: 'Mật khẩu hiện tại',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;
  @ApiProperty({
    type: String,
    required: true,
    description: 'Mật khẩu mới',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_REGEX, {
    message: 'Invalid password',
  })
  newPassword: string;
}
