import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class PasswordReset {
  @Prop({ type: String, required: true })
  email: string;
  @Prop({ type: String, required: true })
  token: string;
  @Prop({ type: Date, required: true })
  expireIn: Date;
}
export const PasswordResetSchema = SchemaFactory.createForClass(PasswordReset);
export type PasswordResetDocument = PasswordReset & Document;
