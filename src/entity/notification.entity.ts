import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NotificationAction } from '@util/enums';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, required: true })
  sender: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true })
  receiver: Types.ObjectId;
  @Prop({ Type: String, required: true })
  action: string;
  @Prop({ type: Types.ObjectId, required: false, ref: 'Post' })
  post?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: false, ref: 'Comment' })
  comment?: Types.ObjectId;
  @Prop({ type: Boolean, required: true })
  seen: boolean;
}
export type NotificationDocument = Notification & Document;
export const NotificationSchema = SchemaFactory.createForClass(Notification);
