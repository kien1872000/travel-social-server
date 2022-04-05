import {
  Controller,
  Get,
  UseGuards,
  Request,
  Put,
  Body,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Query,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express/multer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { User } from '@decorator/user.decorator';
import { PostInput } from '@dto/post/post-new.dto';
import { imageOrVideoFileFilter, storage } from '@helper/storage.helper';
import { PostLimit, Time } from '@util/enums';
import { PostsService } from '../providers/posts.service';
import { HashtagsService } from '@hashtag/hashtags.service';
import { PaginateQuery } from '@decorator/pagination.decorator';
import { POSTS_PER_PAGE } from '@util/constants';
import { PaginateOptions } from '@util/types';

@ApiTags('Post')
@ApiBearerAuth()
@Controller('post')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(
    private postsService: PostsService,
    private hashtagsService: HashtagsService,
  ) {}
  @Post('new-post')
  @ApiOperation({ description: 'Tạo Post mới' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: PostInput })
  @UseInterceptors(
    AnyFilesInterceptor({
      fileFilter: imageOrVideoFileFilter,
      storage: storage,
    }),
  )
  async createNewPost(
    @User() user,
    @Request() req,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() postPrivateInput: PostInput,
  ) {
    if (req.fileValidationError) {
      throw new BadRequestException(
        'Invalid file provided, [image or video files allowed]',
      );
    }
    if (!files || files.length <= 0)
      throw new BadRequestException('Images or videos files required');
    postPrivateInput.mediaFiles = files;
    return this.postsService.createNewPost(user._id, postPrivateInput);
  }

  @Get('search/posts')
  @ApiOperation({ description: 'Tìm kiếm post' })
  @ApiQuery({
    type: String,
    name: 'search',
    required: false,
    description:
      'Nhập chuỗi tìm kiếm, chuỗi có thể bao gồm nhiều hashtag và string',
  })
  @ApiQuery({
    type: PaginateOptions,
  })
  async searchPosts(
    @User() user,
    @Query('search') search: string,
    @PaginateQuery(POSTS_PER_PAGE) { page, perPage }: PaginateOptions,
  ) {
    return this.postsService.searchPosts(user._id, search, page, perPage);
  }
  @Get('posts')
  @ApiQuery({
    type: String,
    name: 'postLimit',
    enum: PostLimit,
    description: 'Chọn phạm vi post:  profile, newsfeed',
    required: true,
  })
  @ApiQuery({
    type: String,
    name: 'userId',
    required: false,
    description:
      'id của user muốn lấy post, nếu trong trang cá nhân của mình thì không cần truyền cũng đc',
  })
  @ApiQuery({ type: PaginateOptions })
  @ApiOperation({
    description: 'Lấy post trong trang cá nhân, newsfeed',
  })
  async getPosts(
    @PaginateQuery(POSTS_PER_PAGE) { page, perPage }: PaginateOptions,

    @Query('postLimit') postLimit: PostLimit,
    @Query('userId') userId: string,
    @User() user,
  ) {
    if (userId) {
      if (postLimit !== PostLimit.Profile) return;
    } else userId = user._id;
    return this.postsService.getPosts(page, perPage, userId, postLimit);
  }
  @Get('posts/by-hashtag')
  @ApiQuery({
    type: PaginateOptions,
  })
  @ApiQuery({
    type: String,
    enum: Time,
    name: 'time',
    description:
      'Thời gian lọc hashtag: ngày, tháng, năm, all. Không chọn thì lấy all',
  })
  @ApiQuery({
    type: String,
    name: 'hashtag',
    description: 'Hashtag muốn lấy các posts',
  })
  async getPostsByHahstag(
    @Query('time') time: string,
    @Query('hashtag') hashtag: string,
    @PaginateQuery(POSTS_PER_PAGE) { page, perPage }: PaginateOptions,
    @User() user,
  ) {
    if (!time) time = Time.All;
    return this.postsService.getPostsByHashtag(
      user._id,
      time,
      hashtag.trim(),
      page,
      perPage,
    );
  }
  @Get('post/:postId')
  @ApiParam({
    type: String,
    name: 'postId',
    description: 'Id của post muốn lấy thông tin',
  })
  @ApiOperation({ description: 'Lấy thông tin của post theo id' })
  async getPostById(@Param('postId') postId: string, @User() user) {
    return this.postsService.getPostById(postId, user._id);
  }
}
