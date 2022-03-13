import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ActivationInput {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  activationCode: string;
}
export class SendActivationCodeInput {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
