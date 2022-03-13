import { Types } from 'mongoose';

export class JwtPayLoad {
  _id: Types.ObjectId;
  isActive: boolean;
}
