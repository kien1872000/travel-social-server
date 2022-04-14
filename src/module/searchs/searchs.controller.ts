import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { PaginateQuery } from '@decorator/pagination.decorator';
import { User } from '@decorator/user.decorator';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UsersSearchService } from '@user/providers/users-search.service';
import { SEARCH_USER_PER_PAGE } from '@util/constants';
import { SearchAllDetailFilter, SearchUserFilter } from '@util/enums';
import { PaginateOptions } from '@util/types';
import { filter } from 'rxjs';
import { SearchsService } from './searchs.service';

@Controller('searchs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Search')
export class SearchsController {
  constructor(
    private searchsService: SearchsService,
    private readonly usersSearchService: UsersSearchService,
  ) {}
  @Get('users')
  @ApiOperation({
    description:
      'search tất cả user theo tên, search trong danh sách following, follower và search user để mời trong chat group (danh sách những user không có trong chat group)',
  })
  @ApiQuery({
    type: String,
    name: 'search',
    description: 'input để search',
  })
  @ApiQuery({ type: PaginateOptions })
  @ApiQuery({
    type: String,
    name: 'filter',
    enum: SearchUserFilter,
    description: 'Lọc danh sách search',
  })
  @ApiQuery({
    type: String,
    required: false,
    name: 'target',
    description:
      'mục tiêu muốn search, có thể là user nào đó hoặc chat group, search all hoặc trong profile của current user thì không cần truyền',
  })
  async searchUsers(
    @Query('search') search: string,
    @User() user,
    @Query('filter') filter: string,
    @Query('target') target: string,
    @PaginateQuery(SEARCH_USER_PER_PAGE) { page, perPage }: PaginateOptions,
  ) {
    return this.usersSearchService.getUserSearchList(
      search,
      page,
      perPage,
      user._id,
      false,
      filter,
      target,
    );
  }
  @Get('all')
  @ApiQuery({
    type: String,
    name: 'search',
    description: 'input để search',
  })
  @ApiQuery({ type: PaginateOptions })
  async searchAll(
    @Query('search') search: string,
    @User() user,
    @PaginateQuery(SEARCH_USER_PER_PAGE) { page, perPage }: PaginateOptions,
  ) {
    return this.searchsService.searchAll(search, page, perPage, user._id);
  }
  @Get('all/detail')
  @ApiQuery({
    type: String,
    name: 'search',
    description: 'input để search',
  })
  @ApiQuery({
    type: String,
    name: 'filter',
    enum: SearchAllDetailFilter,
    description: 'Lọc danh sách search',
  })
  @ApiQuery({ type: PaginateOptions })
  async searchAllDetail(
    @Query('filter') filter: string,
    @Query('search') search: string,
    @User() user,
    @PaginateQuery(SEARCH_USER_PER_PAGE) { page, perPage }: PaginateOptions,
  ) {
    return this.searchsService.searchAllDetail(
      search,
      filter,
      page,
      perPage,
      user._id,
    );
  }
}
