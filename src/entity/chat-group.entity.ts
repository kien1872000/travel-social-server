import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class ChatGroup {
  @Prop({ type: [String], required: false })
  image: string[];
  @Prop({ type: String })
  name: string;
  @Prop({ type: Boolean, required: true })
  isPrivate: boolean;
  @Prop({ type: [Types.ObjectId], required: true, ref: 'User' })
  participants: Types.ObjectId[];
}
export type ChatGroupDocument = ChatGroup & Document;
export const ChatGroupSchema = SchemaFactory.createForClass(ChatGroup);
