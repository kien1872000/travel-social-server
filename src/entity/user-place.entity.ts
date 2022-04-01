import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserPlace {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true, ref: 'Place' })
  place: Types.ObjectId;
}
export type UserPlaceDocument = UserPlace & Document;
export const UserPlaceSchema = SchemaFactory.createForClass(UserPlace);
