import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { FollowingsService } from '../providers/followings.service';
import { FollowingInput } from '@dto/following/following.dto';
import { User } from '@decorator/user.decorator';

@Controller('following')
@ApiTags('Following')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FollowingsController {
  constructor(private followingsService: FollowingsService) {}
  @Post('add/followings')
  @ApiBody({ type: FollowingInput })
  @ApiOperation({ description: 'Theo dõi người dùng khác' })
  async addFollowings(@Body() followingInput: FollowingInput, @Request() req) {
    return this.followingsService.addFollowing(
      req.user.userId,
      followingInput.followingId,
    );
  }
  @Delete('unfollow')
  @ApiBody({ type: FollowingInput })
  @ApiOperation({ description: 'Bỏ theo dõi người dùng' })
  async unFollow(@Body() followingInput: FollowingInput, @Request() req) {
    return this.followingsService.unFollow(
      req.user.userId,
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
    type: Number,
    name: 'page',
    required: false,
    description:
      'Số thứ tự của page là các số tự nhiên, không truyền thì lấy page đầu tiên',
  })
  @ApiOperation({ description: 'Lấy danh sách những người user đang theo dõi' })
  async getFollowings(
    @User() user,
    @Query('userId') userId: string,
    @Query('page') page: number,
  ) {
    if (!userId) userId = user._id;
    return this.followingsService.getFollowings(userId, page, user._id);
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
    type: Number,
    name: 'page',
    required: false,
    description:
      'Số thứ tự của page là các số tự nhiên, không truyền thì lấy page đầu tiên',
  })
  @ApiOperation({
    description: 'Lấy danh sách những người đang theo dõi user',
  })
  async getFollowers(
    @User() user,
    @Query('userId') userId: string,
    @Query('page') page: number,
  ) {
    if (!userId) userId = user._id;
    return this.followingsService.getFollowers(userId, page, user._id);
  }
}
