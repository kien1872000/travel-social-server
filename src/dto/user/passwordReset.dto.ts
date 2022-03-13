import { ApiProperty } from '@nestjs/swagger';
import { PASSWORD_REGEX } from '@util/constants';
import { IsEmail, IsString, Matches } from 'class-validator';

export class PasswordResetInput {
  @ApiProperty({ type: String, required: true })
  @IsEmail()
  email: string;
  @ApiProperty({ type: String, required: true })
  @Matches(PASSWORD_REGEX, {
    message: 'Invalid password',
  })
  newPassword: string;
  @ApiProperty({ type: String, required: true })
  @IsString()
  token: string;
}
