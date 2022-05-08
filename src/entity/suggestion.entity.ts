import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Suggestion {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;
  @Prop({ type: String })
  startDate: string;
  @Prop({ type: String })
  endDate: string;
  @Prop({ type: Object })
  selectedTravelType: Record<string, unknown>;
  @Prop({ type: Object })
  selectedTravelWith: Record<string, unknown>;
  @Prop({ type: Object })
  travelCity: Record<string, unknown>;
  @Prop({ type: Object })
  travelPlace: Record<string, unknown>;
  @Prop({ type: Object })
  vehicleChoose: Record<string, unknown>;
  @Prop({ type: Object })
  flightDetail: Record<string, unknown>;
  @Prop({ type: Object })
  hotelSelect: Record<string, unknown>;
}
export type SuggestionDocument = Suggestion & Document;
export const SuggestionSchema = SchemaFactory.createForClass(Suggestion)