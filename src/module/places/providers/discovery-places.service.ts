import { DiscoveryPlacesDto, VisitorsPlace } from '@dto/place/discovery.dto';
import { PostOutput } from '@dto/post/post-new.dto';
import { Place, PlaceDocument } from '@entity/place.entity';
import { UserPlaceDocument } from '@entity/user-place.entity';
import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostPlaceService } from '@post/providers/post-place.service';
import { DISCOVERY_LENGTH } from '@util/constants';
import { PaginationRes } from '@util/types';
import { Model } from 'mongoose';
import { UserPlacesService } from './user-places.service';

@Injectable()
export class DiscoveryPlacesService {
  constructor(
    @InjectModel(Place.name) private readonly placeModel: Model<PlaceDocument>,
    @Inject(forwardRef(() => PostPlaceService))
    private readonly postPlaceService: PostPlaceService,
    private readonly userPlacesService: UserPlacesService,
  ) {}
  public async getDiscoveryPlaces(): Promise<DiscoveryPlacesDto[]> {
    try {
      const places = await this.placeModel
        .find({})
        .sort('-visiteds')
        .limit(DISCOVERY_LENGTH)
        .select('-__v');
      const promises: Promise<[VisitorsPlace, number]>[] = [];
      for (const place of places) {
        const placeId = place._id.toString();
        const visitorsAndRelatedPosts = async () => {
          return await Promise.all([
            this.userPlacesService.getUserVisiteds(placeId, 5),
            this.postPlaceService.getNumberOfRelatedPosts(placeId),
          ]);
        };
        promises.push(visitorsAndRelatedPosts());
      }
      const visitorsAndRelatedPosts = await Promise.all(promises);
      return places.map((i) => {
        const [visitorsPlace, relatedPosts] = visitorsAndRelatedPosts.find(
          (element) => {
            const [visitorsPlace] = element;
            return visitorsPlace.placeId === i._id;
          },
        );
        return {
          _id: i._id,
          name: i.name,
          formattedAddress: i.formattedAddress,
          coordinate: i.coordinate,
          visits: i.visits,
          suggestedVisitors: visitorsPlace.visitors,
          relatedPosts: relatedPosts,
        };
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getDiscoveryDetail(
    placeId: string,
    currentUser: string,
    page: number,
    perPage: number,
  ): Promise<PaginationRes<PostOutput>> {
    try {
      return await this.postPlaceService.getDiscoveryPosts(
        placeId,
        page,
        perPage,
        currentUser,
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
