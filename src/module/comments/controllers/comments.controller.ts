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

@Controller('comment')
@ApiTags('Comment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommentsController {
  constructor(private commentService: CommentsService) {}

  @Post('/addCommentToPost')
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

  @Post('/addReplyToComment')
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
    @Request() req,
    @Query('commentId') commentId: string,
    @Query('comment') comment: string,
  ) {
    const userId = req.user.userId.toString();
    return this.commentService.addReplyToComment(userId, commentId, comment);
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
  async deleteComment(@Request() req, @Query('commentId') commentId: string) {
    const userId = req.user.userId.toString();
    return this.commentService.deleteComment(userId, commentId);
  }

  @Get('/getCommentsOfPost/:postId')
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
    type: Number,
    name: 'pageNumber',
    required: false,
    description: 'page number',
  })
  async getListComments(
    @Request() req,
    @Query('postId') postId: string,
    @Query('pageNumber') pageNumber: number,
  ) {
    const userId = req.user.userId.toString();
    return this.commentService.getListCommentParent(userId, postId, pageNumber);
  }

  @Get('/getCommentsReply/:commentId')
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
    type: Number,
    name: 'pageNumber',
    required: false,
    description: 'page number',
  })
  async getListCommentReply(
    @Request() req,
    @Query('commentId') commentId: string,
    @Query('pageNumber') pageNumber: number,
  ) {
    const userId = req.user.userId.toString();
    return this.commentService.getListCommentReply(
      userId,
      commentId,
      pageNumber,
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
