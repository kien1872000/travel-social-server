import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PostOutput, TrendingPostOutput } from '@dto/post/postNew.dto';
import { FileType, Post, PostDocument } from '@entity/post.entity';
import { MapsHelper } from '@helper/maps.helper';
import { StringHandlersHelper } from '@helper/stringHandler.helper';
import { FollowingsService } from '@following/providers/followings.service';
import { HashtagsService } from '@hashtag/hashtags.service';
import { MediaFilesService } from '@mediaFile/mediaFiles.service';
import {
  GROUPS_SUGGESSTION_LENGTH,
  POSTS_PER_PAGE,
  TRENDING_LENGTH,
  VIET_NAM_TZ,
} from 'src/util/constants';
import { Interaction, PostLimit, Privacy, Time } from 'src/util/enums';
@Injectable()
export class PostsService {
  // Chỉ dùng cho trending
  public async getPostsByHashtag(
    currentUser: string,
    time: string,
    hashtag: string,
    pageNumber: number,
  ): Promise<TrendingPostOutput> {
    try {
      const limit = POSTS_PER_PAGE;
      const skip =
        !pageNumber || pageNumber < 0 ? 0 : pageNumber * POSTS_PER_PAGE;
      let match;
      if (time === Time.All) {
        match = { hashtags: hashtag, isPublic: true };
      } else {
        const start = new Date(
          this.stringHandlersHelper.getStartAndEndDateWithTime(time, true)[0],
        );
        const end = new Date(
          this.stringHandlersHelper.getStartAndEndDateWithTime(time, true)[1],
        );

        match = {
          hashtags: hashtag,
          isPublic: true,
          createdAt: { $gte: start, $lte: end },
        };
      }
      const promises = await Promise.all([
        this.postModel
          .find(match)
          .populate('user', ['displayName', 'avatar'])
          .populate('group', ['name', 'backgroundImage'])
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        this.postModel.countDocuments(match),
      ]);

      const posts = promises[0].map((post) =>
        this.mapsHelper.mapToPostOutPut(post, currentUser),
      );
      return { popular: promises[1], posts: posts };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private stringHandlersHelper: StringHandlersHelper,
    private mapsHelper: MapsHelper,
    @Inject(forwardRef(() => MediaFilesService))
    private filesService: MediaFilesService,
    private followingsService: FollowingsService,
    private hashtagsService: HashtagsService,
  ) {}

  public async createNewPost(
    userId: string,
    description: string,
    imageOrVideos: Express.Multer.File[],
    groupId?: string,
  ): Promise<PostOutput> {
    try {
      const isPublic = true;
      // if (groupId) {
      //   const group = await this.groupsService.getGroup(groupId, userId);
      //   if (!group)
      //     throw new BadRequestException('You have not joined the group');
      //   else isPublic = Privacy.Public === group.privacy;
      // }
      const fileUrlPromises = [];
      for (const item of imageOrVideos) {
        const filePath = `post/imageOrVideos/${userId}${this.stringHandlersHelper.generateString(
          15,
        )}`;
        const promise = this.filesService.saveFile(
          item,
          filePath,
          description,
          userId,
          groupId,
        );
        fileUrlPromises.push(promise);
      }

      const fileUrls: FileType[] = await Promise.all(fileUrlPromises);
      const hashtags =
        this.stringHandlersHelper.getHashtagFromString(description);
      const newPost: Partial<PostDocument> = {
        group: Types.ObjectId(groupId),
        user: Types.ObjectId(userId),
        isPublic: isPublic,
        description: description.trim(),
        mediaFiles: fileUrls,
        hashtags: hashtags,
        likes: 0,
        comments: 0,
      };
      let postId;
      if (!groupId) delete newPost.group;
      if (isPublic) {
        const promises = await Promise.all([
          new this.postModel(newPost).save(),
          this.hashtagsService.addHastags(hashtags),
        ]);
        postId = promises[0]._id;
      } else postId = (await new this.postModel(newPost).save())._id;
      const post = await this.postModel
        .findById(postId)
        .populate('user', ['displayName', 'avatar'])
        .populate('group', ['name', 'backgroundImage']);
      return this.mapsHelper.mapToPostOutPut(post, userId);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getPost(postId: string): Promise<Post> {
    try {
      return await this.postModel.findById(postId);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  public getPostsWithLimit(
    pageNumber: number,
    currentUser: string,
    limit: PostLimit,
    groupId: string,
  ): Promise<PostOutput[]> {
    switch (limit) {
      case PostLimit.Group:
        break;
      //return this.getPostsGroup(pageNumber, currentUser, groupId);
      case PostLimit.Profile:
        return this.getPostsProfile(pageNumber, currentUser);
      case PostLimit.NewsFeed:
      default:
        return this.getPostsNewFeed(pageNumber, currentUser);
    }
  }

  public async updateTotalPostCommentsOrLikes(
    postId: string,
    interaction: Interaction,
    count: number,
  ): Promise<Post> {
    try {
      let update;
      switch (interaction) {
        case Interaction.Comment:
          update = { $inc: { comments: count } };
          break;
        case Interaction.Like:
        default:
          update = { $inc: { likes: count } };
          break;
      }
      return await this.postModel.findByIdAndUpdate(postId, update);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  // private async getPostsGroup(
  //   pageNumber: number,
  //   currentUser: string,
  //   groupId: string,
  // ): Promise<PostOutput[]> {
  //   try {
  //     if (groupId) {
  //       if (!(await this.groupsService.IsMemberOfGroup(currentUser, groupId)))
  //         throw new BadRequestException('You have not joined the group');
  //     }
  //     return await this.getPosts(
  //       pageNumber,
  //       currentUser,
  //       PostLimit.Group,
  //       groupId,
  //     );
  //   } catch (error) {
  //     throw new InternalServerErrorException(error);
  //   }
  // }
  private async getPostsProfile(
    pageNumber: number,
    currentUser: string,
  ): Promise<PostOutput[]> {
    try {
      return await this.getPosts(pageNumber, currentUser, PostLimit.Profile);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  private async getPostsNewFeed(
    pageNumber: number,
    currentUser: string,
  ): Promise<PostOutput[]> {
    try {
      return await this.getPosts(pageNumber, currentUser);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  private async getPosts(
    pageNumber: number,
    currentUser: string,
    option?: PostLimit,
    groupId?: string,
  ): Promise<PostOutput[]> {
    const limit = POSTS_PER_PAGE;
    const skip =
      !pageNumber || pageNumber < 0 ? 0 : pageNumber * POSTS_PER_PAGE;
    const followings = await this.followingsService.getFollowingIds(
      currentUser,
    );
    followings.push(currentUser);
    const userObjectIds = followings.map((i) => new Types.ObjectId(i));
    let match = {};
    switch (option) {
      case PostLimit.Group:
        match = { group: new Types.ObjectId(groupId) };
        if (!groupId)
          match = {
            user: new Types.ObjectId(currentUser),
            group: { $exists: true },
          };
        break;
      case PostLimit.Profile:
        match = {
          user: new Types.ObjectId(currentUser),
          group: { $exists: false },
        };
        break;
      case PostLimit.NewsFeed:
      default:
        match = {
          $or: [
            { user: { $in: userObjectIds }, group: { $exists: false } },
            { user: new Types.ObjectId(currentUser), group: { $exists: true } },
          ],
        };
    }
    const posts = await this.postModel
      .find(match)
      .populate('user', ['_id', 'displayName', 'avatar'])
      .populate('group', ['_id', 'name', 'backgroundImage'])
      .select(['-mediaFiles._id'])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const result = posts.map((post) =>
      this.mapsHelper.mapToPostOutPut(post, currentUser),
    );
    return result;
  }

  public async searchPosts(userId: string, search: string, pageNumber: number) {
    try {
      if (!search) return [];
      const limit = POSTS_PER_PAGE;
      const skip = !pageNumber || pageNumber <= 0 ? 0 : pageNumber * limit;
      search = search.trim();
      // console.log(search)
      const hashtagsInsearch =
        this.stringHandlersHelper.getHashtagFromString(search);
      let rmwp = search.split(' ').join('');
      hashtagsInsearch.forEach((ht) => {
        rmwp = rmwp.replace(ht, '');
      });
      if (hashtagsInsearch?.length > 0 && rmwp.length === 0) {
        return this.searchPostByHashtags(hashtagsInsearch, limit, skip, userId);
      } else {
        console.log(search);
        const posts = await this.postModel
          .find({ description: { $regex: search } })
          // .find({ $text: { $search: search } })
          .populate('user', ['avatar', 'displayName'])
          .sort([['date', 1]])
          .select(['-__v'])
          .skip(skip)
          .limit(limit);

        const postsResult = posts.map((post) =>
          this.mapsHelper.mapToPostOutPut(post, userId),
        );
        return {
          searchResults: posts.length,
          postsResult,
        };
      }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async searchPostByHashtags(
    hashtagsArr: string[],
    limit: number,
    skip: number,
    userId: string,
  ) {
    try {
      if (hashtagsArr?.length === 1) {
        const hashtagInfo = await this.hashtagsService.getHashtag(
          hashtagsArr[0],
        );
        if (hashtagInfo) {
          const postByHashtag = await this.postModel
            .find({
              hashtags: hashtagsArr[0],
            })
            .populate('user', ['avatar', 'displayName'])
            .sort([['date', 1]])
            .select(['-__v'])
            .skip(skip)
            .limit(limit);

          const postsResult = postByHashtag.map((post) =>
            this.mapsHelper.mapToPostOutPut(post, userId),
          );
          return {
            hashtagInfo,
            postByHashtag: postsResult,
          };
        }
      } else {
        const postByHashtags = await this.postModel
          .find({
            hashtags: { $all: hashtagsArr },
          })
          .populate('user', ['avatar', 'displayName'])
          .sort([['date', 1]])
          .select(['-__v'])
          .skip(skip)
          .limit(limit);
        const postsResult = postByHashtags.map((post) =>
          this.mapsHelper.mapToPostOutPut(post, userId),
        );
        return {
          searchReults: postByHashtags.length,
          postByHashtags: postsResult,
        };
        // return {
        //   searchReults: postByHashtags.length,
        //   postByHashtags,
        // };
      }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  public async getTrending(currentUser: string): Promise<PostOutput[]> {
    try {
      const posts: PostDocument[] = await this.postModel.aggregate([
        {
          $addFields: {
            total: {
              $sum: [
                '$reactions.loves',
                '$reactions.likes',
                '$reactions.hahas',
                '$reactions.wows',
                '$reactions.sads',
                '$reactions.angrys',
              ],
            },
          },
        },
        {
          $sort: {
            total: -1,
          },
        },
        {
          $lookup: {
            from: 'users',
            let: { user: 'user' },
            pipeline: [{ $project: { _id: 1, displayName: 1, avatar: 1 } }],
            as: 'user',
          },
        },
        { $match: { group: { $exists: false } } },
        {
          $project: {
            user: { $arrayElemAt: ['$user', 0] },
            description: 1,
            mediaFiles: 1,
            reactions: 1,
            comments: 1,
            createdAt: 1,
          },
        },

        { $limit: TRENDING_LENGTH },
      ]);

      const result = posts.map((post) =>
        this.mapsHelper.mapToPostOutPut(post, currentUser),
      );
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getPostById(
    postId: string,
    currentUser: string,
  ): Promise<PostOutput> {
    try {
      const post = await this.postModel
        .findById(postId)
        .populate('user', ['displayName', 'avatar']);
      // .populate('group', ['_id', 'name', 'backgroundImage']);
      return this.mapsHelper.mapToPostOutPut(post, currentUser);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  // public async getMostPostsGroupIds(userId: string): Promise<any[]> {
  //   try {
  //     const time = this.stringHandlersHelper.getStartAndEndDate(VIET_NAM_TZ);
  //     const start = new Date(time[0]);
  //     const end = new Date(time[1]);
  //     const groupIds = await this.postModel.aggregate([
  //       {
  //         $match: {
  //           createdAt: { $gte: start, $lte: end },
  //           user: Types.ObjectId(userId),
  //           group: { $exists: true },
  //         },
  //       },
  //       { $group: { _id: { group: '$group' }, totalPosts: { $sum: 1 } } },
  //       { $sort: { totalPosts: -1 } },
  //       {
  //         $project: {
  //           groupId: '$_id.group',
  //           totalPosts: 1,
  //           _id: 0,
  //         },
  //       },
  //       { $limit: GROUPS_SUGGESSTION_LENGTH },
  //     ]);
  //     return groupIds;
  //   } catch (error) {
  //     throw new InternalServerErrorException(error);
  //   }
  // }
  // public async deleteManyPostsOfGroup(groupId: string): Promise<void> {
  //   try {
  //     await this.postModel.deleteMany({ group: Types.ObjectId(groupId) });
  //   } catch (err) {
  //     throw new InternalServerErrorException(err);
  //   }
  // }
  public async getPostIdsInProfile(userId: string): Promise<string[]> {
    try {
      const posts = await this.postModel
        .find({
          user: Types.ObjectId(userId),
          group: { $exists: false },
        })
        .select(['_id']);
      return posts.map((post) => (post as any)._id.toString());
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
