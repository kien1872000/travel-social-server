import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { PaginateQuery } from '@decorator/pagination.decorator';
import { User } from '@decorator/user.decorator';
import { CreatePoolDto, getStakingDto, StakePoolDto } from '@dto/pool/stake-pool.dto';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UsersSearchService } from '@user/providers/users-search.service';

import { PoolService } from './pool.service';

@Controller('pool')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Pool')
export class PoolController {
  constructor(
    private poolService: PoolService,
    private readonly usersSearchService: UsersSearchService,
  ) { }

  @Post('getSignature')
  @ApiOperation({ summary: 'stake into Pool' })
  @ApiBody({
    type: StakePoolDto,
  })
  async stake(@Body() stakingDto: StakePoolDto, @User() user) {
    return this.poolService.verifyMaxStake(stakingDto, user._id)
  }

  @Post('createPool')
  @ApiOperation({ summary: 'stake into Pool' })
  @ApiBody({
    type: CreatePoolDto,
  })
  async createPool(@Body() createPoolDto: CreatePoolDto) {
    return this.poolService.createPool(createPoolDto)
  }

  @Get()
  @ApiOperation({ summary: 'Get list Pool active' })
  async findAll(
  ): Promise<any> {
    return this.poolService.getListPool();
  }

  @Post('/getStakingData')
  @ApiOperation({ summary: 'Get list Pool active' })
  @ApiBody({
    type: getStakingDto
  })
  async getStakingData(
    @Body() getStakingDto: getStakingDto,
    @User() user
  ): Promise<any> {
    return this.poolService.getStakingDataOfAddress(getStakingDto, user._id);
  }
}
