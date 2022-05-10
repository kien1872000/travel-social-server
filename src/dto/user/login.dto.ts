import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

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

export class LoginAddressDto {
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

  @IsString()
  @ApiProperty({
    required: true,
    type: 'string',
    example:
      '0x95170610db759cc5bcee14bf2485d22e6c17c8f4fc643b5a564b4df132d2068669f33c28104c5b232f76f06cf02bc71b12526004e32f3f46a96b2a04bfb380ed1b',
  })
  signature: string;
}
