import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: { updatedAt: false } })
export class Interest {
  @Prop({ type: Types.ObjectId, required: true })
  owner: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: false })
  user?: Types.ObjectId;
  @Prop({ type: String, required: false })
  hashtag?: string;
  @Prop({ type: String, required: false })
  place?: string;
}
export type InterestDocument = Interest & Document;
export const InterestSchema = SchemaFactory.createForClass(Interest)