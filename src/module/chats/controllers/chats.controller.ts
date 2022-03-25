import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { ChatsService } from '@chat/providers/chats.service';
import { PaginateQuery } from '@decorator/pagination.decorator';
import { User } from '@decorator/user.decorator';
import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CHATS_PERPAGE } from '@util/constants';
import { PaginateOptions } from '@util/types';

@Controller('chat')
@ApiBearerAuth()
@ApiTags('Chat')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private chatsService: ChatsService) {}
  @Get('recent-chats')
  @ApiQuery({ type: PaginateOptions })
  @ApiOperation({ description: 'Lấy danh sách chat với người khác' })
  async getChatsList(
    @PaginateQuery(CHATS_PERPAGE) paginateOptions: PaginateOptions,
    @User() user,
  ) {
    return this.chatsService.getRecentChats(
      user._id,
      paginateOptions.page,
      paginateOptions.perPage,
    );
  }
}
