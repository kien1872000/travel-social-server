import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { EMAIL_REGEX, PASSWORD_REGEX } from '@util/constants';

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

export class RegisterAddress {
  @IsString()
  @ApiProperty({
    required: true,
    type: 'string',
    example: '0xF992eB5EeC850772CA51d2fdF1D82697E85c8558',
  })
  walletAddress: string;

  @IsString()
  @IsEmail()
  @ApiProperty({
    required: true,
    type: 'string',
    example: 'tony.nguyen@gmail.com',
  })
  email: string;
}