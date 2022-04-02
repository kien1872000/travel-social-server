import { Place } from '@entity/place.entity';

export class DiscoveryPlacesDto extends Place {
  suggestedVisitors: Visitor[];
  relatedPosts: number;
}
export class Visitor {
  _id: string;
  displayName: string;
  avatar: string;
}
export class VisitorsPlace {
  visitors: Visitor[];
  placeId: string;
}
