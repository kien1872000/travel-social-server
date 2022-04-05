import { PlaceDetailDto, SearchPlaceDto } from '@dto/place/goong-map.dto';
import { SearchPlaceInput, UpdatePlaceDto } from '@dto/place/place.dto';
import { Coordinate, Place, PlaceDocument } from '@entity/place.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { paginate } from '@util/paginate';
import { PaginationRes } from '@util/types';
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
    placeId: string,
  ): Promise<void> {
    try {
      const [userPlace, place] = await Promise.all([
        this.userPlacesService.updateUserPlace(userId, placeId, postId),
        this.findPlaceById(placeId),
      ]);
      if (!place) {
        const placeDetail = await this.goongmapService.placeDetail(placeId);
        const newPlace: Place = {
          _id: placeDetail.placeId,
          formattedAddress: placeDetail.formattedAddress,
          name: placeDetail.name,
          coordinate: placeDetail.coordinate,
          visits: 1,
        };
        await new this.placeModel(newPlace).save();
        return;
      }
      if (!userPlace) {
        await this.placeModel.findOneAndUpdate(
          { _id: placeId },
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
  public async searchExistingPlaces(
    input: string,
    page: number,
    perPage: number,
  ): Promise<PaginationRes<PlaceDocument>> {
    try {
      const query = this.placeModel
        .find({ $text: { $search: input } })
        .select('-__v');
      return await paginate(query, { page: page, perPage });
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException(error);
    }
  }
}
