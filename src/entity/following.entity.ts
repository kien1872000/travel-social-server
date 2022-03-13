import { Type } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class Following {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  following: Types.ObjectId;
}
export const FollowingSchema = SchemaFactory.createForClass(Following);
export type FollowingDocument = Following & Document;
