import { Interest, InterestDocument } from '@entity/interest.entity';
import { Post, PostDocument } from '@entity/post.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { InterestType } from '@util/enums';
import { Model, Types } from 'mongoose';

@Injectable()
export class InterestsService {
  constructor(
    @InjectModel(Interest.name)
    private readonly interestModel: Model<InterestDocument>,
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}
  public async addInterest(postId: string, currentUser: string): Promise<void> {
    try {
      const post = await this.postModel.findById(postId);
      const interestHashtags = post.hashtags.map((i) => {
        return { owner: Types.ObjectId(currentUser), hashtag: i };
      });
      const interests: Interest[] = [
        ...interestHashtags,
        {
          owner: Types.ObjectId(currentUser),
          user: post.user,
        },
        {
          owner: Types.ObjectId(currentUser),
          place: post.place,
        },
      ];
      await this.interestModel.insertMany(interests);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getInterests(user: string, type?: string): Promise<string[]> {
    try {
      const groupField = { owner: '$owner', interestObject: '$hashtag' };
      let match: any = {
        owner: Types.ObjectId(user),
        hashtag: { $exists: true },
      };
      switch (type) {
        case InterestType.User:
          groupField.interestObject = '$user';
          match = { owner: match.owner, user: { $exists: true } };
          break;
        case InterestType.Place:
          groupField.interestObject = '$place';
          match = { owner: match.owner, place: { $exists: true } };
          break;
        case InterestType.Hashtag:
        default:
          groupField.interestObject = '$hashtag';
      }
      const result = await this.interestModel.aggregate([
        {
          $match: match,
        },
        {
          $addFields: {
            period: {
              $ceil: {
                $divide: [
                  { $subtract: [new Date(), '$createdAt'] },
                  1000 * 60 * 30,
                ],
              },
            },
          },
        },
        {
          $group: {
            _id: groupField,
            points: { $sum: { $pow: [0.6, '$period'] } },
            period: { $first: '$period' },
          },
        },
        {
          $project: {
            // period: 1,
            // points: 1,
            _id: 0,
            interestObject: '$_id.interestObject',
          },
        },
        { $sort: { points: -1 } },
        { $limit: 5 },
      ]);
      return result.map((i) => i.interestObject);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }
  public async deleteOldInterest(): Promise<void> {
    try {
      const timeToDelete = new Date(
        new Date().setDate(new Date().getDate() - 7),
      );
      await this.interestModel.deleteMany({
        createdAt: {
          $lte: timeToDelete,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  
}
