import {
  Controller,
  Get,
  UseGuards,
  Request,
  Post,
  Query,
  Delete,
  Body,
  Put,
  Param,
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
import { CommentsService } from '../providers/comments.service';
import { User } from '@decorator/user.decorator';
import { PaginateOptions } from '@util/types';
import { PaginateQuery } from '@decorator/pagination.decorator';
import { LIKE_OF_POSTS_PERPAGE, POSTS_PER_PAGE } from '@util/constants';

@Controller('comment')
@ApiTags('Comment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommentsController {
  constructor(private commentService: CommentsService) {}

  @Post('/add/comment-to-post')
  @ApiOperation({
    description: 'thêm comment mới',
  })
  @ApiQuery({
    type: String,
    name: 'postId',
    required: true,
    description: 'id của post cần comment',
  })
  @ApiQuery({
    name: 'comment',
    type: String,
    description: 'nội dung',
  })
  async addComment(
    @Request() req,
    @Query('postId') postId: string,
    @Query('comment') comment: string,
  ) {
    const userId = req.user.userId.toString();
    return this.commentService.addComment(userId, postId, comment);
  }

  @Post('/add/reply-to-comment')
  @ApiOperation({
    description: 'thêm reply mới',
  })
  @ApiQuery({
    type: String,
    name: 'commentId',
    required: true,
    description: 'id của  comment',
  })
  @ApiQuery({
    name: 'comment',
    type: String,
    description: 'nội dung',
  })
  async addReply(
    @User() user,
    @Query('commentId') commentId: string,
    @Query('comment') comment: string,
  ) {
    return this.commentService.addReplyToComment(user._id, commentId, comment);
  }

  @Delete('/delete')
  @ApiOperation({
    description: 'Xoa comment',
  })
  @ApiQuery({
    type: String,
    name: 'commentId',
    required: true,
    description: 'id của comment cần xoa',
  })
  async deleteComment(@User() user, @Query('commentId') commentId: string) {
    return this.commentService.deleteComment(user._id, commentId);
  }

  @Get('/comments/of-post/:postId')
  @ApiOperation({
    description: 'get comment',
  })
  @ApiQuery({
    type: String,
    name: 'postId',
    required: true,
    description: 'id của post',
  })
  @ApiQuery({
    type: PaginateOptions,
  })
  async getListComments(
    @User() user,
    @Query('postId') postId: string,
    @PaginateQuery(POSTS_PER_PAGE) paginateOptions: PaginateOptions,
  ) {
    return this.commentService.getListCommentParent(
      user._id,
      postId,
      paginateOptions.page,
      paginateOptions.perPage,
    );
  }

  @Get('/comment-replies/:commentId')
  @ApiOperation({
    description: 'get comment reply',
  })
  @ApiQuery({
    type: String,
    name: 'commentId',
    required: true,
    description: 'id của comment',
  })
  @ApiQuery({
    type: PaginateOptions,
  })
  async getListCommentReply(
    @User() user,
    @Query('commentId') commentId: string,
    @PaginateQuery(LIKE_OF_POSTS_PERPAGE) paginateOptions: PaginateOptions,
  ) {
    return this.commentService.getListCommentReply(
      user._id,
      commentId,
      paginateOptions.page,
      paginateOptions.perPage,
    );
  }
  // @Get('/statistic')
  // @ApiOperation({
  //   description: 'Thống kê comments trong profile theo thời gian',
  // })
  // @ApiQuery({
  //   type: String,
  //   name: 'userId',
  //   description:
  //     'id của user muốn lấy thống kê, nếu là user hiện tại thì không cần truyền',
  //   required: false,
  // })
  // @ApiQuery({ type: String, enum: Time, name: 'time' })
  // async getCommentsSatistic(
  //   @Query('time') time: string,
  //   @Query('userId') userId: string,
  //   @Request() req,
  // ) {
  //   if (!userId) userId = req.user.userId;
  //   return this.commentService.getCommentsStatisticByTime(userId, time);
  // }
}
