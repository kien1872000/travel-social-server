import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginInput {
  @ApiProperty({ type: String, required: true, description: 'User email' })
  @IsString()
  @IsNotEmpty()
  email: string;
  @ApiProperty({ type: String, required: true, description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginOutput {
  refreshToken: string;
  accessToken: string;
  displayName: string;
  avatar: string;
  sex: string;
}
