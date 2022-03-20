import { NotificationDto } from '@dto/notification/notification.dto';
import {
  Notification,
  NotificationDocument,
} from '@entity/notification.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
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
      };
      return await new this.notificationModel(notification).save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
