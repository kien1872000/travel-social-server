import {
  Controller,
  Get,
  UseGuards,
  Request,
  Put,
  Body,
  Post,
  UseInterceptors,
  BadRequestException,
  UploadedFiles,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { User } from '@decorator/user.decorator';
import { ChangePasswordInput } from '@dto/user/changePassword.dto';
import { ProfileImageInput, UserInfoInput } from '@dto/user/userProfile.dto';
import { imageFileFilter, storage } from '@helper/storage.helper';
import { UsersService } from '../providers/users.service';
import { UsersSearchService } from '@user/providers/users-search.service';
import { PaginateOptions } from '@util/types';
import { PaginateQuery } from '@decorator/pagination.decorator';
import { SEARCH_USER_PER_PAGE } from '@util/constants';
import { SearchUserFilter } from '@util/enums';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private readonly usersSearchService: UsersSearchService,
  ) {}
  @Get('profile')
  @ApiQuery({
    type: String,
    name: 'userId',
    required: false,
    description:
      'Id của user muốn lấy profile, nếu muốn lấy thông tin của current user có thể ko truyền cũng được',
  })
  @ApiBearerAuth()
  @ApiOperation({ description: 'Lấy thông tin user' })
  async getUserProfile(@User() user, @Query('userId') userId: string) {
    if (!userId) userId = user._id.toString();
    return this.usersService.getUserProfile(user._id, userId);
  }
  @Put('change-password')
  @ApiOperation({ description: 'Đổi mật khẩu' })
  @ApiBody({ type: ChangePasswordInput })
  async changePassword(
    @Body() changePasswordInput: ChangePasswordInput,
    @User() user,
  ) {
    return this.usersService.updateNewPassword(user._id, changePasswordInput);
  }
  @Put('update-info')
  @ApiOperation({ description: 'Cập nhật thông tin' })
  @ApiBody({ type: UserInfoInput })
  async updateInfo(@Body() userInfoInput: UserInfoInput, @User() user) {
    return this.usersService.updateInfo(user._id, userInfoInput);
  }
  @Post('upload/profile-image')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'coverPhoto', maxCount: 1 },
      ],
      {
        fileFilter: imageFileFilter,
        storage: storage,
      },
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    description:
      'Cập nhật ảnh đại diện và ảnh bìa, nếu không truyền hoặc truyền null thì không cập nhật',
  })
  @ApiBody({ type: ProfileImageInput })
  uploadFile(
    @Request() req,
    @User() user,
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File;
      coverPhoto?: Express.Multer.File;
    },
  ) {
    if (req.fileValidationError) {
      throw new BadRequestException(
        'invalid file provided, [image files allowed]',
      );
    }
    return this.usersService.updateProfileImage(
      user._id,
      files?.avatar ? files.avatar[0] : null,
      files?.coverPhoto ? files.coverPhoto[0] : null,
    );
  }
}
