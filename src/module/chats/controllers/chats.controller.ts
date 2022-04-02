import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { ChatsService } from '@chat/providers/chats.service';
import { PaginateQuery } from '@decorator/pagination.decorator';
import { User } from '@decorator/user.decorator';
import { CreateChatGroupDto } from '@dto/chat/chat-group.dto';
import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CHATS_PERPAGE } from '@util/constants';
import { PaginateOptions } from '@util/types';
import { userInfo } from 'os';

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
    @PaginateQuery(CHATS_PERPAGE) { page, perPage }: PaginateOptions,
    @User() user,
  ) {
    return this.chatsService.getRecentChats(user._id, page, perPage);
  }
  @Get('inbox/:chatGroupId')
  @ApiQuery({ type: PaginateOptions })
  @ApiParam({
    type: String,
    name: 'chatGroupId',
    description: 'id của group chat muốn xem inbox',
  })
  async getInbox(
    @User() user,
    @Param('chatGroupId') chatGroupId,
    @PaginateQuery(CHATS_PERPAGE)
    { page, perPage }: PaginateOptions,
  ) {
    return this.chatsService.getInbox(user._id, chatGroupId, page, perPage);
  }
  @Post('create/chat-group')
  @ApiBody({ type: CreateChatGroupDto })
  async createChatGroup(@User() user, createChatGroupDto: CreateChatGroupDto) {
    // return this.chatsService.createChatGroup()
  }
}
