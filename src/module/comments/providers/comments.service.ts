import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from '@entity/comment.entity';
import { StringHandlersHelper } from '@helper/string-handler.helper';
import { PostsService } from '@post/providers/posts.service';
import { Interaction } from '@util/enums';
import { FOLLOWINGS_PER_PAGE, POSTS_PER_PAGE } from '@util/constants';
import { PaginationRes } from '@util/types';
import { paginate } from '@util/paginate';
import { UserCommentDto } from '@dto/comment/user-comment.dto';
import { MapsHelper } from '@helper/maps.helper';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private readonly mapsHelper: MapsHelper,
    private stringHandlersHelper: StringHandlersHelper,
    private postService: PostsService,
  ) {}
  public async addComment(
    userId: string,
    postId: string,
    comment: string,
  ): Promise<Comment> {
    try {
      const checkPost = await this.postService.getPost(postId);
      if (!checkPost) {
        throw new BadRequestException('Post không tồn tại');
      }

      await this.postService.updateTotalPostCommentsOrLikes(
        postId,
        Interaction.Comment,
        1,
      );
      const addComment = new this.commentModel({
        postId: Types.ObjectId(postId),
        userId: Types.ObjectId(userId),
        parentId: null,
        comment,
        replys: 0,
      });
      return await addComment.save();
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async addReplyToComment(
    userId: string,
    commentId: string,
    comment: string,
  ): Promise<Comment> {
    try {
      const cmt = await this.commentModel.findById(commentId);
      if (!cmt) throw new BadRequestException('Comment không tồn tại');
      const commentToUpdateReplys = cmt.parentId
        ? cmt.parentId
        : Types.ObjectId(commentId);
      const [result, _, __] = await Promise.all([
        new this.commentModel({
          postId: cmt.postId,
          userId: Types.ObjectId(userId),
          parentId: commentToUpdateReplys,
          comment: comment,
          replys: 0,
        }).save(),
        this.commentModel.findByIdAndUpdate(commentToUpdateReplys, {
          $inc: {
            replys: 1,
          },
        }),
        this.postService.updateTotalPostCommentsOrLikes(
          cmt.postId.toString(),
          Interaction.Comment,
          1,
        ),
      ]);
      return result;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async deleteComment(userId: string, commentId: string): Promise<void> {
    try {
      const cmt = await this.commentModel.findById(commentId);
      if (!cmt) throw new BadRequestException('Comment không tồn tại');
      const checkIfMyComment = await this.commentModel.findOne({
        userId: Types.ObjectId(userId),
      });
      if (!checkIfMyComment)
        throw new BadRequestException(
          'bạn không có quyền xóa comment không phải của bạn',
        );
      await this.postService.updateTotalPostCommentsOrLikes(
        cmt.postId.toString(),
        Interaction.Comment,
        -1,
      );
      if (cmt.parentId != null) {
        await this.commentModel.findByIdAndUpdate(cmt.parentId, {
          $inc: {
            replys: -1,
          },
        });
      }
      await Promise.all([
        this.commentModel.findByIdAndDelete(commentId),
        this.commentModel.deleteMany({ parentId: commentId }),
      ]);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  private async getListCommentParent(
    postId: string,
    page: number,
    perPage: number,
  ): Promise<PaginationRes<UserCommentDto>> {
    try {
      const post = await this.postService.getPost(postId);
      if (!post) throw new BadRequestException('Post không tồn tại');
      const query = this.commentModel
        .find({
          postId: Types.ObjectId(postId),
          parentId: null,
        })
        .populate('userId', ['displayName', 'avatar'])
        .select(['-__v', '-updatedAt']);

      const comments = await paginate(query, {
        perPage: perPage,
        page: page,
      });
      return {
        items: comments.items.map((i) => {
          const user = i.userId as any;
          return {
            commentId: (i as any)._id,
            comment: i.comment,
            userId: user._id,
            displayName: user.displayName,
            avatar: user.avatar,
            replys: i.replys,
            createdAt: (i as any).createdAt,
          };
        }),
        meta: comments.meta,
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async getListCommentReply(
    userId: string,
    commentId: string,
    page: number,
    perPage: number,
  ): Promise<PaginationRes<Partial<UserCommentDto>>> {
    try {
      const cmt = await this.commentModel.findById(commentId);
      if (!cmt) throw new BadRequestException('Comment không tồn tại');
      const query = this.commentModel
        .find({
          parentId: Types.ObjectId(commentId),
        })
        .populate('userId', ['displayName', 'avatar'])
        .select(['-__v', '-updatedAt']);
      const replys = await paginate(query, {
        perPage: perPage,
        page: page,
      });
      return {
        items: replys.items.map((i) => this.mapsHelper.mapToUserCommentDto(i)),
        meta: replys.meta,
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  // public async getCommentsStatisticByTime(
  //   userId: string,
  //   time: string,
  // ): Promise<StatisticOutPut[]> {
  //   try {
  //     const range = this.stringHandlersHelper.getStartAndEndDateWithTime(time);
  //     const postsToSearch = (
  //       await this.postService.getPostIdsInProfile(userId)
  //     ).map((postId) => Types.ObjectId(postId));
  //     const reactionsStatistic = await this.commentModel.aggregate([
  //       {
  //         $match: {
  //           createdAt: { $gte: new Date(range[0]), $lte: new Date(range[1]) },
  //           postId: { $in: postsToSearch },
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: {
  //             year: { $year: { date: '$createdAt', timezone: VIET_NAM_TZ } },
  //             month: { $month: { date: '$createdAt', timezone: VIET_NAM_TZ } },
  //             day: {
  //               $dayOfMonth: { date: '$createdAt', timezone: VIET_NAM_TZ },
  //             },
  //           },
  //           date: { $first: '$createdAt' },
  //           scales: { $sum: 1 },
  //         },
  //       },
  //       {
  //         $sort: { date: 1 },
  //       },
  //       {
  //         $project: {
  //           date: 1,
  //           scales: 1,
  //           _id: 0,
  //         },
  //       },
  //     ]);
  //     const format = 'YYYY-MM-DD';
  //     return reactionsStatistic.map((i) => {
  //       const scales = (i as any).scales;
  //       const date = this.stringHandlersHelper.getDateWithTimezone(
  //         (i as any).date,
  //         VIET_NAM_TZ,
  //         format,
  //       );
  //       return {
  //         scales: scales,
  //         date: date,
  //       };
  //     });
  //   } catch (error) {
  //     console.log(error);

  //     throw new InternalServerErrorException(error);
  //   }
  // }
  public async getComments(
    postId: string,
    commentId: string,
    page: number,
    perPage: number,
  ): Promise<PaginationRes<UserCommentDto>> {
    try {
      if (commentId) {
        const comment = await this.commentModel.findOne({
          _id: Types.ObjectId(commentId),
          postId: Types.ObjectId(postId),
        });

        if (comment) {
          commentId = comment.parentId
            ? comment.parentId.toString()
            : commentId;
        } else throw new BadRequestException('Comment not found');
        return await this.getListCommentWithCommentAtTop(
          postId,
          commentId,
          page,
          perPage,
        );
      }
      return await this.getListCommentParent(postId, page, perPage);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  private async getListCommentWithCommentAtTop(
    postId: string,
    commentId: string,
    page: number,
    perPage: number,
  ): Promise<PaginationRes<UserCommentDto>> {
    try {
      const post = await this.postService.getPost(postId);
      if (!post) throw new BadRequestException('Post không tồn tại');
      const query = this.commentModel.aggregate<CommentDocument>([
        {
          $lookup: {
            from: 'users',
            let: { user: '$userId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$$user', '$_id'] } } },
              { $project: { avatar: 1, displayName: 1 } },
            ],
            as: 'userId',
          },
        },
        {
          $match: {
            postId: Types.ObjectId(postId),
            parentId: null,
          },
        },
        {
          $addFields: {
            sortId: { $eq: ['$_id', Types.ObjectId(commentId)] },
          },
        },
        {
          $sort: { sortId: -1 },
        },
      ]);

      const project = {
        $project: {
          userId: { $arrayElemAt: ['$userId', 0] },
          comment: 1,
          replys: 1,
          createdAt: 1,
        },
      };
      const comments = await paginate(
        query,
        { page: page, perPage: perPage },
        project,
      );
      return {
        items: comments.items.map((i) =>
          this.mapsHelper.mapToUserCommentDto(i),
        ),
        meta: comments.meta,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }
}
