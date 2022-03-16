import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export class FileType {
  @Prop({ type: String })
  url: string;
  @Prop({ type: String })
  type: string;
}

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: Types.ObjectId, ref: 'Group' })
  group?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;
  @Prop({ type: Boolean, required: true })
  isPublic: boolean;
  @Prop({ type: String })
  description: string;
  @Prop({
    type: [{ url: { type: String }, type: { type: String } }],
  })
  mediaFiles: FileType[];
  @Prop({ type: [String] })
  hashtags: string[];
  @Prop({ type: Number, required: true })
  comments: number;
  @Prop({ type: Number, required: true })
  likes: number;
}
export type PostDocument = Post & Document;
export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.index({ description: 'text' });
