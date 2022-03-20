import {
  NotificationDto,
  NotificationMessage,
} from '@dto/notification/notification.dto';
import {
  Notification,
  NotificationDocument,
} from '@entity/notification.entity';
import { UserDocument } from '@entity/user.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { paginate } from '@util/paginate';
import { PaginationRes } from '@util/types';
import { Model, Types } from 'mongoose';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
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
      return {
        items: notifications.items.map((i) => {
          return {
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
      throw new InternalServerErrorException(error);
    }
  }
}
