import { Coordinate } from '@entity/place.entity';

export class SearchPlaceDto {
  placeId: string;
  inputMatchedSubstrings: { length: number; offset: number }[];
  mainText: string;
  mainTextMatchedSubstrings: { length: number; offset: number }[];
  description: string;
}
export interface PlaceDetailDto {
  placeId: string;
  name: string;
  formattedAddress: string;
  coordinate: Coordinate;
  compound: {
    district: string;
    commune: string;
    province: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GeoCodingDto extends Omit<PlaceDetailDto, 'compound'> {}

export interface DistanceMaxtrixDto {
  rows: {
    elements: {
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      status: string;
    }[];
  }[];
}
