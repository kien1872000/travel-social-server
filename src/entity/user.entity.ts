import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Coordinate } from './place.entity';

@Schema()
export class Address {
  @Prop({ type: String, required: true })
  name: string;
  @Prop({ type: String, required: true })
  formattedAddress: string;
  @Prop({ type: Coordinate, required: true })
  coordinate: Coordinate;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true })
  email: string;
  @Prop({ type: String, required: true })
  password: string;
  @Prop({ type: Boolean, require: true })
  isActive: boolean;
  @Prop({ type: String, required: true })
  displayName: string;
  @Prop({ type: Address })
  address: Address;
  @Prop({ type: String, required: true })
  displayNameNoAccent: string;
  @Prop({ type: Date })
  birthday?: Date;
  @Prop({ type: Date, required: true })
  renamableTime: Date;
  @Prop({ type: String })
  bio?: string;
  @Prop({ type: String })
  avatar: string;
  @Prop({ type: String })
  coverPhoto: string;
  @Prop({ type: String })
  refreshToken: string;
  @Prop({ type: Date })
  refreshTokenExpires: Date;
  @Prop({ type: Number })
  sex?: number;
  @Prop({ type: Number, required: true })
  followings: number;
  @Prop({ type: Number, required: true })
  followers: number;
}
export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = Document & User;
UserSchema.index({ displayNameNoAccent: 1, isActive: 1, _id: 1 });
UserSchema.index({ displayName: 1 });
