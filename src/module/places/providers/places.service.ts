import { PlaceDetailDto, SearchPlaceDto } from '@dto/place/goong-map.dto';
import { SearchPlaceInput } from '@dto/place/place.dto';
import { Coordinate, Place, PlaceDocument } from '@entity/place.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GoongMapService } from 'src/goong-map/goong-map.service';
import { UserPlacesService } from './user-places.service';

@Injectable()
export class PlacesService {
  constructor(
    private readonly goongmapService: GoongMapService,
    @InjectModel(Place.name) private readonly placeModel: Model<PlaceDocument>,
    private readonly userPlacesService: UserPlacesService,
  ) {}
  public async searchPlace(
    searchPlaceInputDto: SearchPlaceInput,
  ): Promise<SearchPlaceDto[]> {
    try {
      const coordinate: Coordinate = {
        latitude: searchPlaceInputDto.latitude,
        longitude: searchPlaceInputDto.longitude,
      };
      const places = await this.goongmapService.search(
        searchPlaceInputDto.input,
        searchPlaceInputDto.limit,
        coordinate,
        searchPlaceInputDto.radius,
      );
      return places;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getPlaceDetail(placeId: string): Promise<PlaceDetailDto> {
    try {
      return await this.goongmapService.placeDetail(placeId);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async updateVisits(
    userId: string,
    placeId: string,
    count: number,
  ): Promise<void> {
    try {
      const [userPlace, _] = await Promise.all([
        this.userPlacesService.findUserPlace(userId, placeId),
        this.userPlacesService.createUserPlace(userId, placeId),
      ]);
      if (!userPlace) {
        await this.placeModel.findByIdAndUpdate(placeId, {
          $inc: { visits: count },
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
