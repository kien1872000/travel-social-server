import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { FollowingsService } from '../providers/followings.service';
import { FollowingInput } from '@dto/following/following.dto';
import { User } from '@decorator/user.decorator';
import { PaginateOptions } from '@util/types';
import { PaginateQuery } from '@decorator/pagination.decorator';
import { FOLLOWERS_PER_PAGE, FOLLOWINGS_PER_PAGE } from '@util/constants';

@Controller('following')
@ApiTags('Following')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FollowingsController {
  constructor(private followingsService: FollowingsService) {}
  @Post('add/followings')
  @ApiBody({ type: FollowingInput })
  @ApiOperation({ description: 'Theo dõi người dùng khác' })
  async addFollowings(@Body() followingInput: FollowingInput, @User() user) {
    return this.followingsService.addFollowing(
      user._id,
      followingInput.followingId,
    );
  }
  @Delete('unfollow')
  @ApiBody({ type: FollowingInput })
  @ApiOperation({ description: 'Bỏ theo dõi người dùng' })
  async unFollow(@Body() followingInput: FollowingInput, @User() user) {
    return this.followingsService.unFollow(
      user._id,
      followingInput.followingId,
    );
  }
  @Get('get/followings')
  @ApiQuery({
    type: String,
    name: 'userId',
    required: false,
    description:
      'Id của người muốn lấy danh sách theo dõi, nếu là current user thì ko cần truyền Id',
  })
  @ApiQuery({
    type: PaginateOptions,
  })
  @ApiOperation({ description: 'Lấy danh sách những người user đang theo dõi' })
  async getFollowings(
    @User() user,
    @Query('userId') userId: string,
    @PaginateQuery(FOLLOWINGS_PER_PAGE) { page, perPage }: PaginateOptions,
  ) {
    if (!userId) userId = user._id;
    return this.followingsService.getFollowings(
      userId,
      page,
      perPage,
      user._id,
    );
  }
  @Get('get/followers')
  @ApiQuery({
    type: String,
    name: 'userId',
    required: false,
    description:
      'Id của người muốn lấy danh sách theo dõi, nếu là current user thì ko cần truyền Id',
  })
  @ApiQuery({
    type: PaginateOptions,
  })
  @ApiOperation({
    description: 'Lấy danh sách những người đang theo dõi user',
  })
  async getFollowers(
    @User() user,
    @Query('userId') userId: string,
    @PaginateQuery(FOLLOWERS_PER_PAGE) { page, perPage }: PaginateOptions,
  ) {
    if (!userId) userId = user._id;
    return this.followingsService.getFollowers(userId, page, perPage, user._id);
  }
}
