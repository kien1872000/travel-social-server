import { JwtAuthGuard } from '@auth/jwt-auth.guard';
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
import { PlacesService } from '../providers/places.service';

@Controller('places')
@ApiBearerAuth()
@ApiTags('Place')
@UseGuards(JwtAuthGuard)
export class PlacesController {
  constructor(private readonly placesSerivce: PlacesService) {}
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
}
