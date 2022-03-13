import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class MediaFile {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User'})
  user: Types.ObjectId;
  @Prop({ type: Types.ObjectId})
  group: Types.ObjectId;
  @Prop({ Type: String })
  des: string;
  @Prop({ type: String, required: true })
  type: string;
  @Prop({ type: String, required: true })
  url: string;
}
export const MediaFileSchema = SchemaFactory.createForClass(MediaFile);
export type MediaFileDocument = MediaFile & Document;
