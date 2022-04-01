import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdatePlaceDto {
  @ApiProperty({ type: String, required: true, description: 'tên địa điểm' })
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty({ type: String, required: true, description: 'địa chỉ đầy đủ' })
  @IsString()
  @IsNotEmpty()
  formattedAddress: string;
  @ApiProperty({ type: Number, required: true })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  latitude: number;
  @ApiProperty({ type: Number, required: true })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  longitude: number;
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
