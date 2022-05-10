import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { PaginateQuery } from '@decorator/pagination.decorator';
import { User } from '@decorator/user.decorator';
import { SearchPlaceDto } from '@dto/place/goong-map.dto';
import { SearchPlaceInput } from '@dto/place/place.dto';
import { VehicleDto } from '@dto/place/vehicle.dto';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { POSTS_PER_PAGE, VISITED_PLACES_PERPAGE } from '@util/constants';
import { AdvertisementType, Time } from '@util/enums';
import { PaginateOptions } from '@util/types';
import { DiscoveryPlacesService } from '../providers/discovery-places.service';
import { PlacesService } from '../providers/places.service';
import { VehicleSuggestionService } from '../providers/vehicle-suggestion.service';
import { VisitedPlacesService } from '../providers/visited-places.service';

@Controller('places')
@ApiBearerAuth()
@ApiTags('Place')
@UseGuards(JwtAuthGuard)
export class PlacesController {
  constructor(
    private readonly placesSerivce: PlacesService,
    private readonly visitedPlacesService: VisitedPlacesService,
    private readonly discoveryPlacesService: DiscoveryPlacesService,
    private readonly vehicleSuggestionService: VehicleSuggestionService,
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
    @PaginateQuery(VISITED_PLACES_PERPAGE) { page, perPage }: PaginateOptions,
    @Query('time') time: string,
    @User() user,
    @Query('userId') userId: string,
  ) {
    if (!userId) userId = user._id.toString();
    return await this.visitedPlacesService.getVisitedPlaces(
      userId,
      page,
      perPage,
      time,
    );
  }
  @Get('discovery-places')
  @ApiOperation({ description: 'Danh  sách discovery' })
  async getDiscoveryPlaces(@User() user) {
    return this.discoveryPlacesService.getDiscoveryPlaces(user._id);
  }
  @Get('discovery-detail/:placeId')
  @ApiOperation({ description: 'discovery detail' })
  @ApiParam({
    description: 'id của địa điểm muốn lấy discovery detail',
    name: 'placeId',
    type: String,
  })
  @ApiQuery({ type: PaginateOptions })
  async getDiscoveryDetai(
    @Param('placeId') placeId: string,
    @PaginateQuery(POSTS_PER_PAGE) { page, perPage }: PaginateOptions,
    @User() user,
  ) {
    return this.discoveryPlacesService.getDiscoveryDetail(
      placeId,
      user._id,
      page,
      perPage,
    );
  }
  @Get('advertisements')
  @ApiQuery({ type: String, name: 'type', enum: AdvertisementType })
  async getAdvertisements(@User() user, @Query('type') type: string) {
    return this.placesSerivce.getAdvertisements(user._id, type);
  }
  @Post('suggest/vehicle')
  @ApiBody({ type: VehicleDto })
  async suggestVehicle(
    @Body()
    {
      depatureLat,
      depatureLng,
      destinationLat,
      destinationLng,
      nearDepartureAirports,
      nearDestinationAirports,
    }: VehicleDto,
  ) {
    return this.vehicleSuggestionService.suggestVehicle(
      depatureLat,
      depatureLng,
      destinationLat,
      destinationLng,
      nearDepartureAirports,
      nearDestinationAirports,
    );
  }
}
