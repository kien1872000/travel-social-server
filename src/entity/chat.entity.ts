import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Chat {
  @Prop({ type: Types.ObjectId, required: true, ref: 'ChatGroup' })
  chatGroup: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  owner: Types.ObjectId;
  @Prop({ type: String, required: true })
  message: string;
  @Prop({ type: [Types.ObjectId], required: true })
  seenUsers: Types.ObjectId[];
}
export type ChatDocument = Chat & Document;
export const ChatSchema = SchemaFactory.createForClass(Chat);
