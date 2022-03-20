import { PaginateQuery } from '@decorator/pagination.decorator';
import { User } from '@decorator/user.decorator';
import { LikeInput } from '@dto/like/like.dto';
import {
  Controller,
  Get,
  UseGuards,
  Request,
  Post,
  Query,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { LIKE_OF_POSTS_PERPAGE } from '@util/constants';
import { PaginateOptions } from '@util/types';

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LikesService } from '../providers/likes.service';

@Controller('like')
@ApiTags('Like')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LikesController {
  constructor(private likesSerivce: LikesService) {}
  // @Get('/statistic')
  // @ApiOperation({
  //   description: 'Thống kê likes trong profile theo thời gian',
  // })
  // @ApiQuery({
  //   type: String,
  //   name: 'userId',
  //   description:
  //     'id của user muốn lấy thống kê, nếu là user hiện tại thì không cần truyền',
  //   required: false,
  // })
  // @ApiQuery({ type: String, enum: Time, name: 'time' })
  // async getReactionsSatistic(
  //   @Query('time') time: string,
  //   @Query('userId') userId: string,
  //   @Request() req,
  // ) {
  //   if (!userId) userId = req.user.userId;
  //   return this.likesSerivce.getReactionStatisticByTime(userId, time);
  // }
  @Post('/add/to-post')
  @ApiOperation({
    description: 'thêm like mới',
  })
  @ApiBody({
    type: LikeInput,
  })
  async addLike(@User() user, @Body() { postId }: LikeInput) {
    return this.likesSerivce.addLikeToPost(user._id, postId);
  }

  @Get('/:postId')
  @ApiOperation({
    description: 'Lấy thông tin các lượt likes của 1 post',
  })
  @ApiParam({
    type: String,
    name: 'postId',
    required: true,
    description: 'id của post',
  })
  @ApiQuery({
    type: PaginateOptions,
  })
  async getLikesOfPost(
    @User() user,
    @Param('postId') postId: string,
    @PaginateQuery(LIKE_OF_POSTS_PERPAGE) paginateOptions: PaginateOptions,
  ) {
    return this.likesSerivce.getLikesOfPost(
      user._id,
      postId,
      paginateOptions.page,
      paginateOptions.perPage,
    );
  }
  @Delete('/remove-like')
  @ApiOperation({
    description: 'remove like',
  })
  @ApiBody({
    type: LikeInput,
    required: true,
    description: 'id của post',
  })
  async removeLike(@User() user, @Body() { postId }: LikeInput) {
    return this.likesSerivce.removeLike(user._id, postId);
  }
}
