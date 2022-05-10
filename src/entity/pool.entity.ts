import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Pool {
  @Prop({ type: Number, required: true })
  poolId: string;
  @Prop({ type: Number, required: true })
  apr: number;
  @Prop({ type: Number, required: true })
  lockDuration: number;
}
export const PoolSchema = SchemaFactory.createForClass(Pool);
export type PoolDocument = Pool & Document;
