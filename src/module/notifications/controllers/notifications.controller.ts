import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { PaginateQuery } from '@decorator/pagination.decorator';
import { User } from '@decorator/user.decorator';
import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { NOTIFICATIONS_PERPAGE } from '@util/constants';
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
    @PaginateQuery(NOTIFICATIONS_PERPAGE) paginateOptions: PaginateOptions,
  ) {
    return this.notificationsService.getNotificationList(
      user._id,
      paginateOptions.page,
      paginateOptions.perPage,
    );
  }
}
