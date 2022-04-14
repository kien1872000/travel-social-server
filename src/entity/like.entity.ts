import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Like {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true, ref: 'Post' })
  post: Types.ObjectId;
}
export type LikeDocument = Like & Document;
export const LikeSchema = SchemaFactory.createForClass(Like);
LikeSchema.index({ user: 1, post: 1 });
