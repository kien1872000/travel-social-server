import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Hashtag {
  @Prop({ type: String, required: true })
  hashtag: string;
  @Prop({
    type: Number,
    description: 'Độ phổ biến của hashtag, tính bằng số lần sử dụng',
    required: true,
  })
  popular: number;
}
export type HashtagDocument = Hashtag & Document;
export const HashtagSchema = SchemaFactory.createForClass(Hashtag);
HashtagSchema.index({ hashtag: 1 });
HashtagSchema.index({ popular: 1 });
