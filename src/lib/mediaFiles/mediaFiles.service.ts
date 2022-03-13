import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MediaFileDto } from 'src/dto/mediaFile/mediaFile.dto';
import { MediaFile, MediaFileDocument } from 'src/entity/mediaFile.entity';
import { FileType } from 'src/entity/post.entity';
import { User, UserDocument } from 'src/entity/user.entity';
import { MapsHelper } from 'src/helper/maps.helper';
import { StringHandlersHelper } from 'src/helper/stringHandler.helper';
import { UploadsService } from 'src/uploads/uploads.service';
import {
  MEDIA_FILES_PER_PAGE,
  VIDEOS_PERPAGE,
  VIET_NAM_TZ,
} from 'src/util/constants';
import { File, Privacy } from 'src/util/enums';

@Injectable()
export class MediaFilesService {
  constructor(
    @InjectModel(MediaFile.name) private fileModel: Model<MediaFileDocument>,
    private stringHandlersHelper: StringHandlersHelper,
    private mapsHelper: MapsHelper,
    private uploadsService: UploadsService,
  ) {}
  public async saveFile(
    uploadFile: Express.Multer.File,
    path: string,
    des: string,
    userId: string,
    groupId?: string,
  ): Promise<FileType> {
    try {
      const fileUrl = await this.uploadsService.uploadFile(uploadFile, path);
      const type = uploadFile.mimetype.split('/')[0];
      const newFile = {
        user: new Types.ObjectId(userId),
        group: groupId ? new Types.ObjectId(groupId) : undefined,
        type: type,
        des: des,
        url: fileUrl,
      };
      await new this.fileModel(newFile).save();
      const file = { url: fileUrl, type: type };
      return file;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  // public async getFilesInGroup(
  //   type: string,
  //   userId: string,
  //   pageNumber: number,
  //   groupId: string,
  // ): Promise<MediaFileDto[]> {
  //   try {
  //     if (!this.groupsService.IsMemberOfGroup(userId, groupId)) {
  //       throw new BadRequestException('You have not joined the group');
  //     }
  //     return await this.getFiles(type, userId, pageNumber, groupId);
  //   } catch (error) {
  //     throw new InternalServerErrorException(error);
  //   }
  // }
  // public async getFiles(
  //   type: string,
  //   userId: string,
  //   pageNumber: number,
  //   groupId?: string,
  // ): Promise<MediaFileDto[]> {
  //   const limit = MEDIA_FILES_PER_PAGE;
  //   const skip =
  //     !pageNumber || pageNumber <= 0
  //       ? (pageNumber = 0)
  //       : pageNumber * MEDIA_FILES_PER_PAGE;
  //   const match = groupId
  //     ? { group: Types.ObjectId(groupId) }
  //     : { user: Types.ObjectId(userId), group: { $exists: false } };
  //   switch (type) {
  //   case File.Video:
  //     (match as any).type = File.Video;
  //     break;
  //   case File.Image:
  //     (match as any).type = File.Image;
  //     break;
  //   case File.All:
  //   default:
  //     break;
  //   }
  //   const files = await this.fileModel
  //     .find(match)
  //     .populate('user', ['displayName', 'avatar'], User.name)
  //     .sort({ createdAt: -1 })
  //     .skip(skip)
  //     .limit(limit);

  //   return files.map((file) => this.mapsHelper.mapToMediaFileDto(file));
  // }
  // public async getVideosWatch(
  //   pageNumber: number,
  //   userId: string,
  // ): Promise<MediaFileDto[]> {
  //   try {
  //     const limit = VIDEOS_PERPAGE;
  //     const skip =
  //       !pageNumber || pageNumber < 0 ? 0 : pageNumber * VIDEOS_PERPAGE;
  //     const videos = await this.fileModel.aggregate([
  //       {
  //         $lookup: {
  //           from: 'users',
  //           let: { user: '$user' },
  //           pipeline: [
  //             { $match: { $expr: { $eq: ['$$user', '$_id'] } } },
  //             { $project: { avatar: 1, displayName: 1 } },
  //           ],
  //           as: 'user',
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: 'groups',
  //           let: {
  //             group: '$group',
  //           },
  //           pipeline: [
  //             {
  //               $match: {
  //                 $expr: {
  //                   $and: [
  //                     { $eq: ['$_id', '$$group'] },
  //                     {
  //                       $or: [
  //                         { $eq: ['$admin_id', Types.ObjectId(userId)] },
  //                         { $in: [Types.ObjectId(userId), '$member'] },
  //                         { $eq: ['$privacy', Privacy.Public] },
  //                       ],
  //                     },
  //                   ],
  //                 },
  //               },
  //             },
  //             { $project: { name: 1, backgroundImage: 1 } },
  //           ],
  //           as: 'group',
  //         },
  //       },
  //       {
  //         $match: {
  //           type: File.Video,
  //         },
  //       },
  //       {
  //         $project: {
  //           user: { $arrayElemAt: ['$user', 0] },
  //           group: { $arrayElemAt: ['$group', 0] },
  //           type: 1,
  //           des: 1,
  //           url: 1,
  //           createdAt: 1,
  //         },
  //       },
  //       {
  //         $sort: { createdAt: -1 },
  //       },
  //       {
  //         $skip: skip,
  //       },
  //       {
  //         $limit: limit,
  //       },
  //     ]);

  //     return videos.map((video) => this.mapsHelper.mapToMediaFileDto(video));
  //   } catch (error) {
  //     throw new InternalServerErrorException();
  //   }
  // }
}
