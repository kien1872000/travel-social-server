import { ConfigService } from '@config/config.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as goongClient from '@goongmaps/goong-sdk';
import * as geocoding from '@goongmaps/goong-sdk/services/geocoding';
import * as autocomplete from '@goongmaps/goong-sdk/services/autocomplete';
import {
  GeoCodingDto,
  PlaceDetailDto,
  SearchPlaceDto,
} from '@dto/place/goong-map.dto';
import { Coordinate } from '@entity/place.entity';
@Injectable()
export class GoongMapService {
  private goongmapClient;
  constructor(configService: ConfigService) {
    this.goongmapClient = goongClient({
      accessToken: configService.get('GOONG_MAP_API_KEY'),
    });
  }
  public search(
    input: string,
    limit: number,
    coordinate?: Coordinate,
    radius?: number,
  ): Promise<SearchPlaceDto[]> {
    let location;
    if (coordinate)
      location = `${coordinate.latitude}, ${coordinate.longitude}`;
    return autocomplete(this.goongmapClient)
      .search({
        input: input,
        limit: limit,
        location: location,
        radius: radius,
      })
      .send()
      .then((response) => {
        const predictions = response.body?.predictions;
        return predictions?.map((i) => {
          return {
            description: i.description,
            placeId: i.place_id,
            inputMatchedSubstrings: i.matched_substrings,
            mainText: i.structured_formatting.main_text,
            mainTextMatchedSubstrings:
              i.structured_formatting.main_text.main_text_matched_substrings,
          };
        });
      })
      .catch((error) => {
        throw new Error(error);
      });
  }
  public placeDetail(placeId: string): Promise<PlaceDetailDto> {
    return autocomplete(this.goongmapClient)
      .placeDetail({
        placeid: placeId,
      })
      .send()
      .then((response) => {
        const result = response.body?.result;
        if (!result) return result;
        return {
          placeId: result.place_id,
          formattedAddress: result.formatted_address,
          name: result.name,
          coordinate: {
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
          },
          compound: result.compound,
        };
      })
      .catch((error) => {
        throw new Error(error);
      });
  }
  public reverseGeocode(coordinate: Coordinate): Promise<GeoCodingDto> {
    const latlng = `${coordinate.latitude}, ${coordinate.longitude}`;
    return geocoding(this.goongmapClient)
      .reverseGeocode({
        latlng: latlng,
      })
      .send()
      .then((response) => {
        const results = response.body?.results;
        if (!results) return results;
        return results.map((i) => {
          return {
            placeId: i.place_id,
            name: i.name,
            formattedAddress: i.formatted_address,
            coordinate: {
              latitude: i.geometry.location.lat,
              longitude: i.geometry.location.lng,
            },
          };
        });
      })
      .catch((error) => {
        throw new Error(error);
      });
  }
}
