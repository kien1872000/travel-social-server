import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PostInput, PostOutput } from '@dto/post/post-new.dto';
import { FileType, Post, PostDocument } from '@entity/post.entity';
import { MapsHelper } from '@helper/maps.helper';
import { StringHandlersHelper } from '@helper/string-handler.helper';
import { FollowingsService } from '@following/providers/followings.service';
import { HashtagsService } from '@hashtag/hashtags.service';
import { MediaFilesService } from 'src/module/media-files/media-files.service';

import { PostLimit } from 'src/util/enums';
import { PaginationRes } from '@util/types';
import { LikesService } from '@like/providers/likes.service';
import { PlacesService } from 'src/module/places/providers/places.service';
import { paginate } from '@util/paginate';
import { HashtagDetailDto } from '@dto/hashtag/hashtag.dto';
import { PostsResultService } from './posts-result.service';
import { Place } from '@entity/place.entity';
@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
    private readonly stringHandlersHelper: StringHandlersHelper,
    private readonly likesService: LikesService,
    private readonly mapsHelper: MapsHelper,
    private readonly filesService: MediaFilesService,
    private readonly followingsService: FollowingsService,
    private readonly hashtagsService: HashtagsService,
    private readonly placesServive: PlacesService,
    private readonly postResultService: PostsResultService,
  ) {}

  public async getPostsByHashtag(
    currentUser: string,
    hashtag: string,
    page: number,
    perPage: number,
  ): Promise<HashtagDetailDto> {
    try {
      const query = this.postModel
        .find({ hashtags: hashtag })
        .populate('user', ['displayName', 'avatar'])
        .populate(
          'place',
          ['name', 'formattedAddress', 'coordinate', 'visits'],
          Place.name,
        );
      const posts = await paginate(query, { page: page, perPage: perPage });

      return {
        popular: posts.meta.totalItems,
        hashtag: hashtag,
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
  ): Promise<void> {
    try {
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
      const newPost: Partial<PostDocument> = {
        place: postInput.placeId,
        user: Types.ObjectId(userId),
        description: postInput.description.trim(),
        mediaFiles: fileUrls,
        hashtags: hashtags,
        likes: 0,
        comments: 0,
      };

      const [post, _] = await Promise.all([
        new this.postModel(newPost).save(),
        this.hashtagsService.addHastags(hashtags),
      ]);
      await this.placesServive.updateVisits(
        userId,
        post._id.toString(),
        1,
        postInput.placeId,
      );
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

  public async getPosts(
    page: number,
    perPage: number,
    currentUser: string,
    option?: PostLimit,
  ): Promise<PaginationRes<PostOutput>> {
    try {
      let match = {};
      switch (option) {
        case PostLimit.Profile:
          match = {
            user: new Types.ObjectId(currentUser),
          };
          break;
        case PostLimit.Following:
          const followings = await this.followingsService.getFollowingIds(
            currentUser,
          );
          followings.push(currentUser);
          const userObjectIds = followings.map((i) => new Types.ObjectId(i));
          match = {
            $or: [
              { user: { $in: userObjectIds } },
              { user: new Types.ObjectId(currentUser) },
            ],
          };
          break;
        case PostLimit.Interest:
        default:
          return await this.postResultService.getPostsResult(
            currentUser,
            page,
            perPage,
          );
      }
      return await this.postResultService.getPostsResult(
        currentUser,
        page,
        perPage,
        false,
        match,
      );
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException(error);
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
        })
        .select(['_id']);
      return posts.map((post) => (post as any)._id.toString());
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
