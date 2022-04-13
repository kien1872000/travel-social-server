import { SearchDto } from '@dto/search/search.dto';
import { HashtagsService } from '@hashtag/hashtags.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PlacesService } from '../places/providers/places.service';

@Injectable()
export class SearchsService {
  constructor(
    private readonly hashtagsService: HashtagsService,
    private readonly placesService: PlacesService,
  ) {}
  public async searchAll(
    input: string,
    page: number,
    perPage: number,
    currentUser: string,
  ) {
    return null;
    try {
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
