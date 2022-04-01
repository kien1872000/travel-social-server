import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PostInput,
  PostOutput,
  TrendingPostOutput,
} from '@dto/post/post-new.dto';
import { FileType, Post, PostDocument } from '@entity/post.entity';
import { MapsHelper } from '@helper/maps.helper';
import { StringHandlersHelper } from '@helper/string-handler.helper';
import { FollowingsService } from '@following/providers/followings.service';
import { HashtagsService } from '@hashtag/hashtags.service';
import { MediaFilesService } from 'src/module/media-files/media-files.service';
import {
  GROUPS_SUGGESSTION_LENGTH,
  POSTS_PER_PAGE,
  TRENDING_LENGTH,
  VIET_NAM_TZ,
} from 'src/util/constants';
import { Interaction, PostLimit, Privacy, Time } from 'src/util/enums';
import { PaginationRes } from '@util/types';
import { paginate } from '@util/paginate';
import { LikesService } from '@like/providers/likes.service';
import { Address } from '@entity/user.entity';
@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
    private readonly stringHandlersHelper: StringHandlersHelper,
    private readonly likesService: LikesService,
    private readonly mapsHelper: MapsHelper,
    @Inject(forwardRef(() => MediaFilesService))
    private readonly filesService: MediaFilesService,
    private readonly followingsService: FollowingsService,
    private readonly hashtagsService: HashtagsService,
  ) {}

  // Chỉ dùng cho trending
  public async getPostsByHashtag(
    currentUser: string,
    time: string,
    hashtag: string,
    page: number,
    perPage: number,
  ): Promise<TrendingPostOutput> {
    try {
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
      const query = this.postModel
        .find(match)
        .populate('user', ['displayName', 'avatar'])
        .populate('group', ['name', 'backgroundImage'])
        .sort({ createdAt: -1 });
      const [posts, poplular] = await Promise.all([
        paginate(query, { page: page, perPage: perPage }),
        this.postModel.countDocuments(match),
      ]);

      return {
        popular: poplular,
        posts: {
          items: await Promise.all(
            posts.items.map(async (i) => {
              const liked = await this.likesService.isUserLikedPost(
                currentUser,
                (i as any)._id.toString(),
              );
              return this.mapsHelper.mapToPostOutPut(i, currentUser, liked);
            }),
          ),
          meta: posts.meta,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async createNewPost(
    userId: string,
    postInput: PostInput,
  ): Promise<PostOutput> {
    try {
      const isPublic = true;
      const fileUrlPromises = [];
      for (const item of postInput.mediaFiles) {
        const filePath = `post/imageOrVideos/${userId}${this.stringHandlersHelper.generateString(
          15,
        )}`;
        const promise = this.filesService.saveFile(
          item,
          filePath,
          postInput.description,
          userId,
        );
        fileUrlPromises.push(promise);
      }

      const fileUrls: FileType[] = await Promise.all(fileUrlPromises);
      const hashtags = this.stringHandlersHelper.getHashtagFromString(
        postInput.description,
      );
      const place: Address = {
        name: postInput.name,
        formattedAddress: postInput.formattedAddress,
        coordinate: {
          latitude: postInput.latitude,
          longitude: postInput.longitude,
        },
      };
      const newPost: Partial<PostDocument> = {
        place: place,
        user: Types.ObjectId(userId),
        isPublic: isPublic,
        description: postInput.description.trim(),
        mediaFiles: fileUrls,
        hashtags: hashtags,
        likes: 0,
        comments: 0,
      };
      let postId;
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
      return this.mapsHelper.mapToPostOutPut(post, userId, false);
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
    page: number,
    perPage: number,
    currentUser: string,
    limit: PostLimit,
    groupId: string,
  ): Promise<PaginationRes<PostOutput>> {
    switch (limit) {
      case PostLimit.Group:
        break;
      //return this.getPostsGroup(pageNumber, currentUser, groupId);
      case PostLimit.Profile:
        return this.getPostsProfile(page, perPage, currentUser);
      case PostLimit.NewsFeed:
      default:
        return this.getPostsNewFeed(page, perPage, currentUser);
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
  private async getPostsProfile(
    page: number,
    perPage: number,
    currentUser: string,
  ): Promise<PaginationRes<PostOutput>> {
    try {
      return await this.getPosts(page, perPage, currentUser, PostLimit.Profile);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  private async getPostsNewFeed(
    page: number,
    perPage: number,
    currentUser: string,
  ): Promise<PaginationRes<PostOutput>> {
    try {
      return await this.getPosts(page, perPage, currentUser);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  private async getPosts(
    page: number,
    perPage: number,
    currentUser: string,
    option?: PostLimit,
    groupId?: string,
  ): Promise<PaginationRes<PostOutput>> {
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
    const query = this.postModel
      .find(match)
      .populate('user', ['_id', 'displayName', 'avatar'])
      .populate('group', ['_id', 'name', 'backgroundImage'])
      .select(['-mediaFiles._id'])
      .sort({ createdAt: -1 });
    const postsResult = await paginate<PostDocument>(query, {
      perPage: perPage,
      page: page,
    });
    return {
      items: await Promise.all(
        postsResult.items.map(async (i) => {
          const liked = await this.likesService.isUserLikedPost(
            currentUser,
            (i as any)._id.toString(),
          );
          return this.mapsHelper.mapToPostOutPut(i, currentUser, liked);
        }),
      ),
      meta: postsResult.meta,
    };
  }

  public async searchPosts(userId: string, search: string, pageNumber: number) {
    try {
      if (!search) return [];
      const limit = POSTS_PER_PAGE;
      const skip = !pageNumber || pageNumber <= 0 ? 0 : pageNumber * limit;
      search = search.trim();
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

        const postsResult = await Promise.all([
          posts.map(async (post) => {
            const liked = await this.likesService.isUserLikedPost(
              userId,
              (post as any)._id.toString(),
            );
            return this.mapsHelper.mapToPostOutPut(post, userId, liked);
          }),
        ]);
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

          const postsResult = postByHashtag.map(async (post) => {
            const liked = await this.likesService.isUserLikedPost(
              userId,
              (post as any)._id.toString(),
            );
            return this.mapsHelper.mapToPostOutPut(post, userId, liked);
          });
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
        const postsResult = postByHashtags.map(async (post) => {
          const liked = await this.likesService.isUserLikedPost(
            userId,
            (post as any)._id.toString(),
          );
          return this.mapsHelper.mapToPostOutPut(post, userId, liked);
        });
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

  public async getPostById(
    postId: string,
    currentUser: string,
  ): Promise<PostOutput> {
    try {
      const [post, liked] = await Promise.all([
        this.postModel
          .findById(postId)
          .populate('user', ['displayName', 'avatar']),
        this.likesService.isUserLikedPost(currentUser, postId),
      ]);
      // .populate('group', ['_id', 'name', 'backgroundImage']);
      return this.mapsHelper.mapToPostOutPut(post, currentUser, liked);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
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
