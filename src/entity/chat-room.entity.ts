import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class ChatRoom {
  @Prop({ type: Types.ObjectId, required: true })
  chatGroup: Types.ObjectId;
  @Prop({
    type: [
      {
        _id: { type: Types.ObjectId, required: true },
        isActive: { type: Boolean, required: true },
      },
    ],
    required: true,
  })
  participants: {
    _id: Types.ObjectId;
    isActive: boolean;
  }[];
}
export type ChatRoomDocument = ChatRoom & Document;
export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
