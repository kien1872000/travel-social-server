import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { MediaFilesService } from './media-files.service';
import { User } from '@decorator/user.decorator';
import { File } from '@util/enums';
import { PaginateQuery } from '@decorator/pagination.decorator';
import { POSTS_PER_PAGE, VIDEOS_PERPAGE } from '@util/constants';
import { PaginateOptions } from '@util/types';
@Controller('media-files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Media Files')
export class MediaFilesController {
  constructor(private mediaFilesService: MediaFilesService) {}
  @Get('profile/media-files')
  @ApiOperation({
    description: 'Danh sách ảnh/video hiển thị trong trang cá nhân',
  })
  @ApiQuery({
    type: String,
    name: 'userId',
    required: false,
    description:
      'Id của user muốn lấy ảnh/video, nếu là current user thì không cần truyền cũng được',
  })
  @ApiQuery({
    type: PaginateOptions,
  })
  @ApiQuery({
    type: String,
    enum: File,
    name: 'type',
    required: false,
    description:
      'Type của media file muốn lấy, không chọn thì lấy hết cả ảnh và video',
  })
  async getMediaFilesProfile(
    @User() user,
    @Query('userId') userId: string,
    @PaginateQuery(VIDEOS_PERPAGE) { page, perPage }: PaginateOptions,
    @Query('type') fileType: string,
  ) {
    if (!userId) userId = user._id;
    return this.mediaFilesService.getFiles(fileType, userId, page, perPage);
  }
  @Get('videos/watch')
  @ApiQuery({ type: PaginateOptions })
  @ApiOperation({
    description:
      'Video cho phần watch, lấy theo thứ tự gần đây nhất, của cả app',
  })
  async getVideosWatch(
    @PaginateQuery(VIDEOS_PERPAGE) { page, perPage }: PaginateOptions,
  ) {
    return this.mediaFilesService.getVideosWatch(page, perPage);
  }
}
