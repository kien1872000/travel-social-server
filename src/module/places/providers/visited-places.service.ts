import { Place } from '@entity/place.entity';
import { UserPlace, UserPlaceDocument } from '@entity/user-place.entity';
import { StringHandlersHelper } from '@helper/string-handler.helper';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Time } from '@util/enums';
import { paginate } from '@util/paginate';
import { PaginationRes } from '@util/types';
import { Model, Types } from 'mongoose';

@Injectable()
export class VisitedPlacesService {
  constructor(
    @InjectModel(UserPlace.name)
    private readonly userPlaceModel: Model<UserPlaceDocument>,
    private readonly stringHandlersHelper: StringHandlersHelper,
  ) {}
  public async getVisitedPlaces(
    userId: string,
    page: number,
    perPage: number,
    timeFilter: string,
  ): Promise<PaginationRes<UserPlaceDocument>> {
    try {
      const match = { user: Types.ObjectId(userId) };
      const [start, end] = this.stringHandlersHelper.getStartAndEndDateWithTime(
        timeFilter,
        true,
      );
      switch (timeFilter) {
        case Time.Week:
        case Time.Month:
        case Time.Year:
          (match as any).lastVisitedDate = {
            $gte: new Date(start),
            $lte: new Date(end),
          };
          break;
        case Time.All:
        default:
          break;
      }

      const query = this.userPlaceModel
        .find(match)
        .populate(
          'place',
          ['name', 'formattedAddress', 'coordinate'],
          Place.name,
        )
        .populate('post', ['mediaFiles'])
        .select(['-_id', 'lastVisitedDate'])
        .sort('-lastVisitedDate');
      return await paginate(query, { perPage: perPage, page: page });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
