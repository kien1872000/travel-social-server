import { NotificationDetailOutput } from '@dto/notification/notification-detail.dto';
import {
  NotificationDto,
  NotificationMessage,
} from '@dto/notification/notification.dto';
import { PostDetail } from '@dto/post/post-detail.dto';
import { UserProfile } from '@dto/user/userProfile.dto';
import {
  Notification,
  NotificationDocument,
} from '@entity/notification.entity';
import { UserDocument } from '@entity/user.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostDetailService } from '@post/providers/post-detail.service';
import { UsersService } from '@user/providers/users.service';
import { NotificationAction } from '@util/enums';
import { paginate } from '@util/paginate';
import { PaginationRes } from '@util/types';
import { Model, Types } from 'mongoose';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    private readonly postDetailService: PostDetailService,
    private readonly usersService: UsersService,
  ) {}
  public async create({
    sender,
    receiver,
    postId,
    commentId,
    action,
  }: NotificationDto): Promise<NotificationDocument> {
    try {
      const notification: Partial<NotificationDocument> = {
        sender: Types.ObjectId(sender),
        receiver: Types.ObjectId(receiver),
        post: postId ? Types.ObjectId(postId) : undefined,
        comment: commentId ? Types.ObjectId(commentId) : undefined,
        action: action,
        seen: false,
      };
      return await new this.notificationModel(notification).save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getNotificationList(
    receiver: string,
    page: number,
    perPage: number,
  ): Promise<PaginationRes<NotificationMessage>> {
    try {
      const query = this.notificationModel
        .find({
          receiver: Types.ObjectId(receiver),
        })
        .populate('sender', ['displayName', 'avatar'])
        .sort({ createdAt: -1 });
      const notifications = await paginate(query, { page: page, perPage });
      console.log(notifications);

      return {
        items: notifications.items.map((i) => {
          return {
            notificationId: (i as any)._id.toString(),
            sender: {
              _id: (i.sender as any)._id,
              displayName: (i.sender as unknown as UserDocument).displayName,
              avatar: (i.sender as unknown as UserDocument).avatar,
            },
            action: i.action,
            postId: i.post?.toString(),
            commentId: i.comment?.toString(),
            createdAt: (i as any).createdAt,
            seen: i.seen,
          };
        }),
        meta: notifications.meta,
      };
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException(error);
    }
  }
  public async showNotificationDetail(
    page: number,
    perPage: number,
    currentUser: string,
    notificationId: string,
  ): Promise<NotificationDetailOutput> {
    try {
      const notification = await this.notificationModel.findOneAndUpdate(
        {
          _id: Types.ObjectId(notificationId),
        },
        { seen: true },
      );
      if (!notification) return;
      let data: UserProfile | PostDetail;
      switch (notification.action) {
        case NotificationAction.Like:
          data = await this.postDetailService.getPostDetail(
            page,
            perPage,
            currentUser,
            notification.post.toString(),
          );
          break;
        case NotificationAction.Comment:
        case NotificationAction.ReplyComment:
          data = await this.postDetailService.getPostDetail(
            page,
            perPage,
            currentUser,
            notification.post.toString(),
            notification.comment.toString(),
          );
          break;
        case NotificationAction.Follow:
          data = await this.usersService.getUserProfile(
            currentUser,
            currentUser,
          );
          break;
        default:
          return;
      }
      return {
        action: notification.action,
        data: data,
      };
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException(error);
    }
  }
}
