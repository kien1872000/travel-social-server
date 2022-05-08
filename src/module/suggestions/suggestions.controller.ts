import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { PaginateQuery } from '@decorator/pagination.decorator';
import { User } from '@decorator/user.decorator';
import { CreateSuggestionDto } from '@dto/suggestion/create-suggestion.dto';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { POSTS_PER_PAGE } from '@util/constants';
import { PaginateOptions } from '@util/types';
import { SuggestionsService } from './suggestions.service';
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('Suggestion')
@Controller()
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}
  @Post('/add-new')
  @ApiBody({ type: CreateSuggestionDto })
  addNewSuggestion(
    @Body() createSuggestionDto: CreateSuggestionDto,
    @User() user,
  ) {
    return this.suggestionsService.saveSuggestion(
      user._id,
      createSuggestionDto,
    );
  }
  @Get('suggestion')
  @ApiQuery({
    name: 'userId',
    type: String,
    required: false,
    description: 'id của user muốn xem, không truyền thì lấy current user',
  })
  @ApiQuery({ type: PaginateOptions })
  getSuggestion(
    @PaginateQuery(POSTS_PER_PAGE) { page, perPage }: PaginateOptions,
    @User() user,
    @Query('userId') userId: string,
  ) {
    if (!userId) userId = user._id;
    return this.suggestionsService.getSuggestion(userId, page, perPage);
  }
}
