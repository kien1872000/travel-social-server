import { PlaceDetailDto, SearchPlaceDto } from '@dto/place/goong-map.dto';
import { SearchPlaceInput, UpdatePlaceDto } from '@dto/place/place.dto';
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
    postId: string,
    count: number,
    updatePlaceDto: UpdatePlaceDto,
  ): Promise<void> {
    try {
      const [userPlace, place] = await Promise.all([
        this.userPlacesService.updateUserPlace(
          userId,
          updatePlaceDto.placeId,
          postId,
        ),
        this.findPlaceById(updatePlaceDto.placeId),
      ]);

      if (!place) {
        const place: Partial<PlaceDocument> = {
          _id: updatePlaceDto.placeId,
          name: updatePlaceDto.name,
          formattedAddress: updatePlaceDto.formattedAddress,
          visits: 1,
          coordinate: {
            latitude: updatePlaceDto.latitude,
            longitude: updatePlaceDto.longitude,
          },
        };
        await new this.placeModel(place).save();
        return;
      }
      if (!userPlace) {
        await this.placeModel.findOneAndUpdate(
          { _id: updatePlaceDto.placeId },
          {
            $inc: { visits: count },
          },
        );
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async findPlaceById(placeId: string): Promise<PlaceDocument> {
    try {
      return await this.placeModel.findOne({ _id: placeId });
    } catch (error) {
      console.log('find');

      throw new InternalServerErrorException(error);
    }
  }
}
