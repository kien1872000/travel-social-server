import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  timestamps: { createdAt: false, updatedAt: 'lastVisitedDate' },
})
export class UserPlace {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user: Types.ObjectId;
  @Prop({ type: String, required: true, ref: 'Place' })
  place: string;
  @Prop({ type: Types.ObjectId, required: true, ref: 'Post' })
  latestPost: Types.ObjectId;
}
export type UserPlaceDocument = UserPlace & Document;
export const UserPlaceSchema = SchemaFactory.createForClass(UserPlace);
