import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePlaceDto {
  @ApiProperty({ type: String, required: true, description: 'id cuả địa điểm' })
  @IsString()
  @IsNotEmpty()
  placeId: string;
}
export class SearchPlaceInput {
  @ApiProperty({
    type: String,
    required: true,
    description: 'đoạn text input muốn search địa điểm',
    name: 'input',
  })
  @IsString()
  @IsNotEmpty()
  input: string;
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    type: Number,
    name: 'latitude',
    required: false,
  })
  latitude: number;
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    required: false,
    type: Number,
    name: 'longitude',
  })
  longitude: number;
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    required: false,
    type: Number,
    name: 'radius',
    description:
      'Bán kính quanh  điểm được chỉ định, có tọa độ là latitude và longitude đã nhập ở trên',
  })
  radius: number;
  @ApiProperty({
    required: false,
    type: Number,
    name: 'limit',
    description: 'Giới hạn kết quả tìm kiếm',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  limit: number;
}
