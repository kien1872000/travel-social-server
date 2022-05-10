import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { EMAIL_REGEX, PASSWORD_REGEX } from '@util/constants';

export class StakePoolDto {
    @IsNotEmpty()
    @ApiProperty({ type: Number, required: true, description: 'pool id' })
    poolId: number;

    @ApiProperty({ type: String, required: true, description: 'wallet address' })
    @IsNotEmpty()
    walletAddress: string;
}


export class CreatePoolDto {
    @IsNotEmpty()
    @ApiProperty({ type: Number, required: true, description: 'pool id' })
    poolId: number;

    @ApiProperty({ type: Number, required: true, description: 'apr' })
    @IsNotEmpty()
    apr: number;

    @ApiProperty({ type: Number, required: true, description: 'lockduration' })
    @IsNotEmpty()
    lockDuration: number;
}


export class getStakingDto {
    @ApiProperty({ type: String, required: true, description: 'wallet address' })
    @IsNotEmpty()
    walletAddress: string;

}
