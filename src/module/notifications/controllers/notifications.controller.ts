import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { PaginateQuery } from '@decorator/pagination.decorator';
import { User } from '@decorator/user.decorator';
import { NotificationDetailInput } from '@dto/notification/notification-detail.dto';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { NOTIFICATIONS_PERPAGE, POSTS_PER_PAGE } from '@util/constants';
import { PaginateOptions } from '@util/types';
import { NotificationsService } from '../providers/notifications.service';

@Controller('notifications')
@ApiTags('Notification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}
  @ApiOperation({
    description: 'Lấy danh sách thông báo, sắp xếp theo thời gian gần nhất',
  })
  @ApiQuery({ type: PaginateOptions })
  @Get()
  async getNotificationList(
    @User() user,
    @PaginateQuery(NOTIFICATIONS_PERPAGE) { page, perPage }: PaginateOptions,
  ) {
    return this.notificationsService.getNotificationList(
      user._id,
      page,
      perPage,
    );
  }
  @ApiOperation({
    description:
      'Xem chi tiết thông báo, các thông báo như like, comment sẽ có phân trang của list comment',
  })
  @ApiQuery({ type: PaginateOptions })
  @ApiBody({ type: NotificationDetailInput })
  @Post('see/notification-detail')
  async seeNotificationDetail(
    @User() user,
    @Body() { notificationId }: NotificationDetailInput,
    @PaginateQuery(POSTS_PER_PAGE) { page, perPage }: PaginateOptions,
  ) {
    return this.notificationsService.showNotificationDetail(
      page,
      perPage,
      user._id,
      notificationId,
    );
  }
}
