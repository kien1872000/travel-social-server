import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class ConnectedSocket {
  @Prop({ type: String, required: true })
  socketId: string;
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user: Types.ObjectId;
}
export type ConnectedSocketDocument = ConnectedSocket & Document;
export const ConnectedSocketSchema =
  SchemaFactory.createForClass(ConnectedSocket);
