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
import { PostInput } from '@dto/post/postNew.dto';
import { imageOrVideoFileFilter, storage } from '@helper/storage.helper';
import { PostLimit, Time } from '@util/enums';
import { PostsService } from '../providers/posts.service';
import { HashtagsService } from '@hashtag/hashtags.service';

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
    return this.postsService.createNewPost(
      user._id,
      postPrivateInput.description,
      files,
    );
  }

  @Get('search/posts')
  @ApiOperation({ description: 'Tìm kiếm post' })
  @ApiQuery({
    type: String,
    name: 'search',
    description:
      'Nhập chuỗi tìm kiếm, chuỗi có thể bao gồm nhiều hashtag và string',
  })
  @ApiQuery({
    type: Number,
    name: 'page',
    description:
      'Nhập số tự nhiên bắt đầu từ 0 tương ứng từng page, nếu nhập page <= 0 thì auto là page đầu tiên',
  })
  async searchUsers(
    @Query('search') search: string,
    @Query('page', ParseIntPipe) page,
    @User() user,
  ) {
    return this.postsService.searchPosts(user._id, search, page);
  }
  @Get('posts')
  @ApiQuery({
    type: Number,
    name: 'page',
    required: false,
  })
  @ApiQuery({
    type: String,
    name: 'postLimit',
    enum: PostLimit,
    description: 'Chọn phạm vi post: group, profile, newsfeed',
    required: true,
  })
  @ApiQuery({
    type: String,
    name: 'groupId',
    required: false,
    description:
      'Nếu chọn phạm vi là post thì thêm groupId, nếu không có groupId thì sẽ lấy tất cả post trong các group đã tham gia',
  })
  @ApiQuery({
    type: String,
    name: 'userId',
    required: false,
    description:
      'id của user muốn lấy post, nếu trong trang cá nhân của mình thì không cần truyền cũng đc',
  })
  @ApiOperation({ description: 'Lấy post trong trang cá nhân' })
  async getPosts(
    @Query('page') pageNumber: number,
    @Query('postLimit') postLimit: PostLimit,
    @Query('groupId') groupId: string,
    @Query('userId') userId: string,
    @User() user,
  ) {
    if (userId) {
      if (postLimit !== PostLimit.Profile) return;
    } else userId = user._id;
    return this.postsService.getPostsWithLimit(
      pageNumber,
      userId,
      postLimit,
      groupId,
    );
  }
  @Get('posts/by-hashtag')
  @ApiQuery({
    type: Number,
    name: 'page',
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
    @Query('page') page: number,
    @User() user,
  ) {
    if (!time) time = Time.All;
    return this.postsService.getPostsByHashtag(
      user._id,
      time,
      hashtag.trim(),
      page,
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
