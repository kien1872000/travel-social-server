import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  isNotEmpty,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { EMAIL_REGEX, PASSWORD_REGEX } from 'src/util/constants';

export class UserSignUp {
  @ApiProperty({ type: String, required: true, description: 'User email' })
  @Matches(EMAIL_REGEX, {
    message: 'Invalid email',
  })
  email: string;
  @ApiProperty({ type: String, required: true, description: 'User password' })
  @Matches(PASSWORD_REGEX, {
    message: 'Invalid password',
  })
  password: string;
  @ApiProperty({ type: String, required: true, description: 'Tên hiển thị' })
  @IsNotEmpty()
  displayName: string;
}
