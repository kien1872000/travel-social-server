import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Activation {
  @Prop({ type: String, required: true })
  email: string;
  @Prop({ type: String, required: true })
  activationCode: string;
  @Prop({ type: Date, required: true })
  expireIn: Date;
}
export const ActivationSchema = SchemaFactory.createForClass(Activation);
export type ActivationDocument = Activation & Document;
