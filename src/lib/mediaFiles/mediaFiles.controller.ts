import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { File } from 'src/util/enums';
import { MediaFilesService } from './mediaFiles.service';

@Controller('media-files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Media Files')
export class MediaFilesController {
  constructor(private mediaFilesService: MediaFilesService) {}
  // @Get('profile/media-files')
  // @ApiOperation({
  //   description: 'Danh sách ảnh/video hiển thị trong trang cá nhân',
  // })
  // @ApiQuery({
  //   type: String,
  //   name: 'userId',
  //   required: false,
  //   description:
  //     'Id của user muốn lấy ảnh/video, nếu là current user thì không cần truyền cũng được',
  // })
  // @ApiQuery({
  //   type: Number,
  //   name: 'pageNumber',
  //   required: false,
  //   description:
  //     'Số thứ tự của trang, bắt đầu từ 0, nếu không truyền hoặc truyền < 0 thì auto trang 0',
  // })
  // @ApiQuery({
  //   type: String,
  //   enum: File,
  //   name: 'type',
  //   required: false,
  //   description:
  //     'Type của media file muốn lấy, không chọn thì lấy hết cả ảnh và video',
  // })
  // async getMediaFilesProfile(
  //   @Request() req,
  //   @Query('userId') userId: string,
  //   @Query('pageNumber') pageNumber: number,
  //   @Query('type') fileType: string,
  // ) {
  //   if (!userId) userId = req.user.userId;
  //   return this.mediaFilesService.getFiles(fileType, userId, pageNumber);
  // }
  // @Get('videos/watch')
  // @ApiQuery({ type: Number, name: 'pageNumber', required: false })
  // @ApiOperation({
  //   description:
  //     'Video cho phần watch, lấy theo thứ tự gần đây nhất, của cả app',
  // })
  // async getVideosWatch(
  //   @Query('pageNumber') pageNumber: number,
  //   @Request() req,
  // ) {
  //   return this.mediaFilesService.getVideosWatch(pageNumber, req.user.userId);
  // }
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
