import { Visitor, VisitorsPlace } from '@dto/place/discovery.dto';
import { PlaceDocument } from '@entity/place.entity';
import { UserPlace, UserPlaceDocument } from '@entity/user-place.entity';
import { UserDocument } from '@entity/user.entity';
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
        place: placeId,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async updateUserPlace(
    userId: string,
    placeId: string,
    postId: string,
  ): Promise<UserPlaceDocument> {
    try {
      return await this.userPlaceModel.findOneAndUpdate(
        { user: Types.ObjectId(userId), place: placeId },
        {
          latestPost: Types.ObjectId(postId),
          user: Types.ObjectId(userId),
          place: placeId,
        },
        { upsert: true },
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getUserVisiteds(
    placeId: string,
    limit: number,
  ): Promise<VisitorsPlace> {
    try {
      const visitors = await this.userPlaceModel
        .find({ place: placeId })
        .populate('user', ['displayName', 'avatar'])
        .select('user')
        .limit(limit);
      return {
        placeId: placeId,
        visitors: visitors.map((i) => i.user as unknown as Visitor),
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
