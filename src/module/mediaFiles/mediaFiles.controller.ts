import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { MediaFilesService } from './mediaFiles.service';
import { User } from '@decorator/user.decorator';
import { File } from '@util/enums';
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
    type: Number,
    name: 'page',
    required: false,
    description:
      'Số thứ tự của trang, bắt đầu từ 0, nếu không truyền hoặc truyền < 0 thì auto trang 0',
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
    @Query('page') page: number,
    @Query('type') fileType: string,
  ) {
    if (!userId) userId = user._id;
    return this.mediaFilesService.getFiles(fileType, userId, page);
  }
  @Get('videos/watch')
  @ApiQuery({ type: Number, name: 'page', required: false })
  @ApiOperation({
    description:
      'Video cho phần watch, lấy theo thứ tự gần đây nhất, của cả app',
  })
  async getVideosWatch(@Query('page') page: number, @User() user) {
    return this.mediaFilesService.getVideosWatch(page, user._id);
  }
  // @Get('files/in/group/:groupId')
  // @ApiParam({ type: String, name: 'groupId' })
  // @ApiQuery({ type: Number, name: 'pageNumber' })
  // @ApiQuery({ type: String, enum: File, name: 'type' })
  // @ApiOperation({ description: 'Lấy file trong group' })
  // async getMediaFilesGroup(
  //   @Request() req,
  //   @Param('groupId') groupId: string,
  //   @Query('pageNumber') pageNumber: number,
  //   @Query('type') fileType: string,
  // ) {
  //   return this.mediaFilesService.getFilesInGroup(
  //     fileType,
  //     req.user.userId,
  //     pageNumber,
  //     groupId,
  //   );
  // }
}
