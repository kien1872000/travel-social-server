import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class RecentChat {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Chat' })
  chat: Types.ObjectId;
  @Prop({ type: [Types.ObjectId], required: true, ref: 'User' })
  participants: Types.ObjectId[];
}
export type RecentChatDocument = RecentChat & Document;
export const RecentChatSchema = SchemaFactory.createForClass(RecentChat);
