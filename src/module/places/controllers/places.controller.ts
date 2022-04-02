import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { PaginateQuery } from '@decorator/pagination.decorator';
import { User } from '@decorator/user.decorator';
import { SearchPlaceDto } from '@dto/place/goong-map.dto';
import { SearchPlaceInput } from '@dto/place/place.dto';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { VISITED_PLACES_PERPAGE } from '@util/constants';
import { Time } from '@util/enums';
import { PaginateOptions } from '@util/types';
import { PlacesService } from '../providers/places.service';
import { VisitedPlacesService } from '../providers/visited-places.service';

@Controller('places')
@ApiBearerAuth()
@ApiTags('Place')
@UseGuards(JwtAuthGuard)
export class PlacesController {
  constructor(
    private readonly placesSerivce: PlacesService,
    private readonly visitedPlacesService: VisitedPlacesService,
  ) {}
  @Get('search')
  @ApiOperation({ description: 'search địa điểm theo text nhập vào' })
  async search(@Query() searchPlaceInput: SearchPlaceInput) {
    return this.placesSerivce.searchPlace(searchPlaceInput);
  }
  @Get('place-detail/:placeId')
  @ApiParam({
    type: String,
    name: 'placeId',
    description: 'id của place muốn get detail',
  })
  async getPlaceDetail(@Param('placeId') placeId: string) {
    return this.placesSerivce.getPlaceDetail(placeId);
  }
  @Get('visited-places')
  @ApiOperation({ description: 'danh sách địa điểm đã đi của user' })
  @ApiQuery({
    type: String,
    name: 'userId',
    required: false,
    description:
      'id của user muốn lấy địa điểm, nếu là current user thì ko cần truyền cũng được',
  })
  @ApiQuery({ type: PaginateOptions })
  @ApiQuery({
    type: String,
    enum: Time,
    name: 'time',
    description: 'Thời gian theo dạng tuần này, tháng này,...',
  })
  async getVisitedPlace(
    @PaginateQuery(VISITED_PLACES_PERPAGE) paginateOptions: PaginateOptions,
    @Query('time') time: string,
    @User() user,
    @Query('userId') userId: string,
  ) {
    if (!userId) userId = user._id.toString();
    return await this.visitedPlacesService.getVisitedPlaces(
      userId,
      paginateOptions.page,
      paginateOptions.perPage,
      time,
    );
  }
}
