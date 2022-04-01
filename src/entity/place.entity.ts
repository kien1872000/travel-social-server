import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Coordinate {
  @Prop({ type: Number, required: true })
  latitude: number;
  @Prop({ type: Number, required: true })
  longitude: number;
}
@Schema()
export class Place {
  @Prop({ type: String, required: true })
  name: string;
  @Prop({ type: String, required: true })
  formattedAddress: string;
  @Prop({ type: Coordinate, required: true })
  coordinate: Coordinate;
  @Prop({ type: Number, required: true })
  visits: number;
}
export type PlaceDocument = Place & Document;
export const PlaceSchema = SchemaFactory.createForClass(Place);
