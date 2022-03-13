import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Hashtag, HashtagDocument } from '@entity/hastag.entity';
import { StringHandlersHelper } from '@helper/stringHandler.helper';
import { TimeCheck } from '@util/enums';

@Injectable()
export class HashtagsService {
  constructor(
    @InjectModel(Hashtag.name) private hashtagModel: Model<HashtagDocument>,
    private stringHandlersHelper: StringHandlersHelper,
  ) {}
  public async addHastags(hashtags: string[]): Promise<void> {
    try {
      const start = new Date(
        this.stringHandlersHelper.getStartAndEndDateWithTime(TimeCheck.Day)[0],
      );
      const end = new Date(
        this.stringHandlersHelper.getStartAndEndDateWithTime(TimeCheck.Day)[1],
      );
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
}
