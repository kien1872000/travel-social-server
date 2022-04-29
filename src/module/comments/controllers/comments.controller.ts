import {
  Controller,
  Get,
  UseGuards,
  Post,
  Query,
  Delete,
  Body,
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
import {
  AddCommentInput,
  AddReplyInput,
  DeleteCommentInput,
} from '@dto/comment/user-comment.dto';

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
  @ApiBody({ type: AddCommentInput })
  async addComment(@User() user, @Body() { postId, comment }: AddCommentInput) {
    return this.commentService.addComment(user._id, postId, comment);
  }

  @Post('/add/reply-to-comment')
  @ApiOperation({
    description: 'thêm reply mới',
  })
  @ApiBody({ type: AddReplyInput })
  async addReply(@User() user, @Body() { commentId, comment }: AddReplyInput) {
    return this.commentService.addReplyToComment(user._id, commentId, comment);
  }

  @Delete('/delete')
  @ApiOperation({
    description: 'Xoa comment',
  })
  @ApiBody({
    type: DeleteCommentInput,
  })
  async deleteComment(@User() user, @Body() { commentId }: DeleteCommentInput) {
    return this.commentService.deleteComment(user._id, commentId);
  }

  @Get('/comments/of-post/:postId')
  @ApiOperation({
    description: 'get comment',
  })
  @ApiParam({
    type: String,
    name: 'postId',
    required: true,
    description: 'id của post',
  })
  @ApiQuery({
    type: String,
    name: 'commentId',
    required: false,
    description: 'id cuả comment muốn gán lên đầu',
  })
  @ApiQuery({
    type: PaginateOptions,
  })
  async getListComments(
    @Param('postId') postId: string,
    @Query('commentId') commentId: string,
    @PaginateQuery(POSTS_PER_PAGE) paginateOptions: PaginateOptions,
  ) {
    return this.commentService.getComments(
      postId,
      commentId,
      paginateOptions.page,
      paginateOptions.perPage,
    );
  }

  @Get('/comment-replies/:commentId')
  @ApiOperation({
    description: 'get comment replies',
  })
  @ApiParam({
    type: String,
    name: 'commentId',
    required: true,
    description: 'id của comment muốn lấy replies',
  })
  @ApiQuery({
    type: PaginateOptions,
  })
  async getListCommentReply(
    @User() user,
    @Param('commentId') commentId: string,
    @PaginateQuery(LIKE_OF_POSTS_PERPAGE) paginateOptions: PaginateOptions,
  ) {
    return this.commentService.getListCommentReply(
      user._id,
      commentId,
      paginateOptions.page,
      paginateOptions.perPage,
    );
  }
}
