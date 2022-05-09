import { PlaceDetailDto, SearchPlaceDto } from '@dto/place/goong-map.dto';
import { SearchPlaceInput, UpdatePlaceDto } from '@dto/place/place.dto';
import { Coordinate, Place, PlaceDocument } from '@entity/place.entity';
import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { hotelUrl } from '@util/constants';
import { AdvertisementType, InterestType } from '@util/enums';
import { paginate } from '@util/paginate';
import { PaginationRes } from '@util/types';
import { Model } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { GoongMapService } from 'src/goong-map/goong-map.service';
import { InterestsService } from 'src/module/interests/interests.service';
import { DiscoveryPlacesService } from './discovery-places.service';
import { UserPlacesService } from './user-places.service';

@Injectable()
export class PlacesService {
  constructor(
    private readonly goongmapService: GoongMapService,
    @InjectModel(Place.name) private readonly placeModel: Model<PlaceDocument>,
    private readonly userPlacesService: UserPlacesService,
    private readonly interestsService: InterestsService,
    private readonly discoveryPlacesService: DiscoveryPlacesService,
    private readonly httpService: HttpService,
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
  public async getAdvertisements(
    user: string,
    type: string = AdvertisementType.Hotel,
  ) {
    try {
      const interestPlaces = await this.interestsService.getInterests(
        user,
        InterestType.Place,
      );
      const url = hotelUrl;
      const coordinates = (
        await this.placeModel
          .find({ _id: { $in: interestPlaces } })
          .select(['-_id', 'coordinate'])
          .limit(interestPlaces.length)
      ).map((i) => i.coordinate);
      for (const coordinate of coordinates) {
        const hotels = await this.getAdvertisementRequest(coordinate, url);
        if (hotels.length > 0) return hotels;
      }

      const discoveryCoordinates = (
        await this.placeModel
          .find({})
          .sort('-visits')
          .limit(10)
          .select(['-_id', 'coordinate'])
      ).map((i) => i.coordinate);
      for (const coordinate of discoveryCoordinates) {
        const hotels = await this.getAdvertisementRequest(coordinate, url);
        return hotels;
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  private async getAdvertisementRequest(
    coordinate: Coordinate,
    url: string,
  ): Promise<any[]> {
    try {
      const params = {
        order_by: 'distance',
        adults_number: '2',
        units: 'metric',
        room_number: '1',
        checkout_date: '2022-05-24',
        filter_by_currency: 'VND',
        locale: 'vi',
        checkin_date: '2022-05-08',
        latitude: '21.856652564000058',
        longitude: '103.34228308400009',
        children_ages: '5,0',
        categories_filter_ids: 'class::2,class::4,free_cancellation::1',
        page_number: '0',
        include_adjacency: 'true',
      };
      const config = {
        params: params,
        headers: {
          'X-RapidAPI-Host': process.env.RAPIDAPI_HOTEL_HOST,
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        },
      };

      return await (
        await lastValueFrom(this.httpService.get(url, config))
      ).data;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
