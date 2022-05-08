import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

export class CreateSuggestionDto {
  @IsString()
  @ApiProperty({ type: String, required: false })
  startDate: string;
  @IsString()
  @ApiProperty({ type: String, required: false })
  endDate: string;
  @IsObject()
  @ApiProperty({ type: Object, required: false })
  selectedTravelType: Record<string, unknown>;
  @IsObject()
  @ApiProperty({ type: Object, required: false })
  selectedTravelWith: Record<string, unknown>;
  @IsObject()
  @ApiProperty({ type: Object, required: false })
  travelCity: Record<string, unknown>;
  @IsObject()
  @ApiProperty({ type: Object, required: false })
  travelPlace: Record<string, unknown>;
  @IsObject()
  @ApiProperty({ type: Object, required: false })
  vehicleChoose: Record<string, unknown>;
  @IsObject()
  @ApiProperty({ type: Object, required: false })
  flightDetail: Record<string, unknown>;
  @IsObject()
  @ApiProperty({ type: Object, required: false })
  hotelSelect: Record<string, unknown>;
}
