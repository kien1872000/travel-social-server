import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Hashtag, HashtagDocument } from '@entity/hastag.entity';

import { HashtagOutput } from '@dto/hashtag/hashtag.dto';
import { paginate } from '@util/paginate';
import { PaginationRes } from '@util/types';
import { InterestsService } from '../interests/interests.service';
import { InterestType } from '@util/enums';

@Injectable()
export class HashtagsService {
  constructor(
    @InjectModel(Hashtag.name) private hashtagModel: Model<HashtagDocument>,
    private readonly interestsService: InterestsService,
  ) {}
  public async addHastags(hashtags: string[]): Promise<void> {
    try {
      if (!hashtags || hashtags == []) return;
      const promises = [];
      for (const ht of hashtags) {
        promises.push(
          this.hashtagModel.updateOne(
            { hashtag: ht },
            { hashtag: ht, $inc: { popular: 1 } },
            { upsert: true },
          ),
        );
      }
      await Promise.all(promises);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getPopularOfHashtag(hashtag: string): Promise<number> {
    try {
      const popular = (await this.hashtagModel.findOne({ hashtag: hashtag }))
        ?.popular;
      return popular ? popular : 0;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getHashtag(hashtag: string): Promise<HashtagDocument> {
    try {
      const hashtagInfo = await this.hashtagModel
        .findOne({ hashtag: hashtag })
        .select(['-__v']);
      return hashtagInfo;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  public async searchHashtags(
    input: string,
    page: number,
    perPage: number,
    user: string,
  ): Promise<PaginationRes<HashtagOutput>> {
    try {
      const interestHashtags = await this.interestsService.getInterests(
        user,
        InterestType.Hashtag,
      );

      const query = this.hashtagModel.aggregate([
        {
          $match: { hashtag: { $regex: input } },
        },
        {
          $addFields: {
            interested: { $in: ['$hashtag', interestHashtags] },
          },
        },
        {
          $sort: { interested: -1, popular: -1 },
        },
      ]);
      const project = { popular: 1, hashtag: 1, _id: 0 };
      return (await paginate(
        query,
        { page, perPage },
        project,
      )) as unknown as PaginationRes<HashtagOutput>;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
