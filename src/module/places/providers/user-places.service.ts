import { UserPlace, UserPlaceDocument } from '@entity/user-place.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class UserPlacesService {
  constructor(
    @InjectModel(UserPlace.name)
    private readonly userPlaceModel: Model<UserPlaceDocument>,
  ) {}
  public async findUserPlace(
    userId: string,
    placeId: string,
  ): Promise<UserPlaceDocument> {
    try {
      return await this.userPlaceModel.findOne({
        user: Types.ObjectId(userId),
        place: Types.ObjectId(placeId),
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async createUserPlace(userId: string, placeId: string): Promise<void> {
    try {
      await new this.userPlaceModel({
        user: Types.ObjectId(userId),
        place: Types.ObjectId(placeId),
      }).save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
