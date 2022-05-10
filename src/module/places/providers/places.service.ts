import { PlaceDetailDto, SearchPlaceDto } from '@dto/place/goong-map.dto';
import { SearchPlaceInput, UpdatePlaceDto } from '@dto/place/place.dto';
import { Coordinate, Place, PlaceDocument } from '@entity/place.entity';
import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  hotelHost,
  hotelUrl,
  restaurantHost,
  restaurantUrl,
} from '@util/constants';
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
    type: string = AdvertisementType.Restaurant,
  ) {
    try {
      const interestPlaces = await this.getInterestPlace(user, 10);
      const coordinates = interestPlaces.map((i) => i.coordinate);
      switch (type) {
        case AdvertisementType.Restaurant:
          for (const coordinate of coordinates) {
            const restaurants = await this.getRestaurantAdvertisement(
              coordinate,
              restaurantUrl,
            );
            if (restaurants.length > 0) return restaurants;
          }
          break;
        case AdvertisementType.Hotel:
        default:
          for (const coordinate of coordinates) {
            const hotels = await this.getHotelAdvertisement(
              coordinate,
              hotelUrl,
            );
            if (hotels.length > 0) return hotels;
          }
          break;
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  private async getHotelAdvertisement(
    coordinate: Coordinate,
    url: string,
  ): Promise<any[]> {
    try {
      const params = {
        order_by: 'distance',
        adults_number: '2',
        units: 'metric',
        room_number: '1',
        checkout_date: new Date(new Date().setDate(new Date().getDate() + 8))
          .toISOString()
          .split('T')[0],
        filter_by_currency: 'VND',
        locale: 'vi',
        checkin_date: new Date(new Date().setDate(new Date().getDate() + 1))
          .toISOString()
          .split('T')[0],
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        include_adjacency: 'true',
      };
      const config = {
        params: params,
        headers: {
          'X-RapidAPI-Host': hotelHost,
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        },
      };

      return await (
        await lastValueFrom(this.httpService.get(url, config))
      ).data.result.map((i) => {
        return {
          type: AdvertisementType.Hotel,
          coordinate: {
            latitude: i.latitude ? i.latitude : null,
            longitude: i.longitude ? i.longitude : null,
          },
          image: i.max_photo_url,
          address: i.address,
          webUrl: i.url,
          name: i.hotel_name,
        };
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  private async getRestaurantAdvertisement(
    coordinate: Coordinate,
    url: string,
  ): Promise<any[]> {
    try {
      const params = {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        limit: '20',
        currency: 'VND',
        distance: '10',
        lunit: 'km',
        lang: 'vi_VN',
      };
      const config = {
        params: params,
        headers: {
          'X-RapidAPI-Host': restaurantHost,
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        },
      };

      return await (
        await lastValueFrom(this.httpService.get(url, config))
      ).data.data.map((i) => {
        return {
          type: AdvertisementType.Restaurant,
          coordinate: {
            latitude: i.latitude ? Number(i.latitude) : null,
            longitude: i.longitude ? Number(i.longitude) : null,
          },
          image: i.photo?.images.large.url,
          address: i.address,
          webUrl: i.web_url,
          name: i.name,
        };
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getInterestPlace(
    user: string,
    limit: number,
  ): Promise<PlaceDocument[]> {
    try {
      const interestPlaces = await this.interestsService.getInterests(
        user,
        InterestType.Place,
      );
      return await this.placeModel.aggregate([
        {
          $addFields: {
            interested: {
              $in: ['$_id', interestPlaces],
            },
          },
        },
        {
          $sort: { interested: -1, visits: -1 },
        },
        {
          $limit: limit,
        },
      ]);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
