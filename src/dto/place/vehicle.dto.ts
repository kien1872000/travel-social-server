import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt, IsNumber } from 'class-validator';

export class Airport {
  @ApiProperty({ type: String, description: 'tên sân bay' })
  name: string;
  @ApiProperty({ type: String, description: 'địa chỉ của sân bay' })
  address: string;
  @ApiProperty({ type: Number })
  lat: number;
  @ApiProperty({ type: Number })
  lng: number;
}
export class VehicleDto {
  @IsNumber()
  @ApiProperty({ type: Number, description: 'vĩ độ điểm đến' })
  depatureLat: number;
  @IsNumber()
  @ApiProperty({ type: Number, description: 'kinh độ điểm đến' })
  depatureLng: number;
  @IsNumber()
  @ApiProperty({ type: Number, description: 'vĩ độ điểm đi' })
  destinationLat: number;
  @IsNumber()
  @ApiProperty({ type: Number, description: 'kinh độ điểm đi' })
  destinationLng: number;
  @IsArray()
  @ApiProperty({ type: [Airport], description: 'Sân bay gần điểm đến' })
  nearDepartureAirports;
  @IsArray()
  @ApiProperty({ type: [Airport], description: 'Sân bay gần điểm đi' })
  nearDestinationAirports;
}
