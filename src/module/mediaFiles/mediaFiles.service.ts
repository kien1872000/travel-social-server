import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MediaFile, MediaFileDocument } from '@entity/mediaFile.entity';
import { FileType } from '@entity/post.entity';
import { MapsHelper } from '@helper/maps.helper';
import { StringHandlersHelper } from '@helper/stringHandler.helper';
import { UploadsService } from '@upload/uploads.service';
import {
  MEDIA_FILES_PER_PAGE,
  VIDEOS_PERPAGE,
  VIET_NAM_TZ,
} from 'src/util/constants';
import { File, Privacy } from 'src/util/enums';
import { PaginationRes } from '@util/types';
import { MediaFileDto } from '@dto/mediaFile/mediaFile.dto';
import { User } from '@entity/user.entity';
import { paginate } from '@util/paginate';
import { INSTANCE_METADATA_SYMBOL } from '@nestjs/core/injector/instance-wrapper';
import { query } from 'express';

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
  public async getFiles(
    type: string,
    userId: string,
    page: number,
    groupId?: string,
  ): Promise<PaginationRes<MediaFileDto>> {
    const match = groupId
      ? { group: Types.ObjectId(groupId) }
      : { user: Types.ObjectId(userId), group: { $exists: false } };
    switch (type) {
      case File.Video:
        (match as any).type = File.Video;
        break;
      case File.Image:
        (match as any).type = File.Image;
        break;
      case File.All:
      default:
        break;
    }
    const query = this.fileModel
      .find(match)
      .populate('user', ['displayName', 'avatar'], User.name)
      .sort({ createdAt: -1 });
    const files = await paginate(query, {
      perPage: MEDIA_FILES_PER_PAGE,
      page: page,
    });
    return {
      items: files.items.map((i) => this.mapsHelper.mapToMediaFileDto(i)),
      meta: files.meta,
    };

    //   return files.map((file) => this.mapsHelper.mapToMediaFileDto(file));
  }
  public async getVideosWatch(
    page: number,
    userId: string,
  ): Promise<PaginationRes<MediaFileDto>> {
    try {
      page = !page || page < 0 ? 0 : page;
      const query = this.fileModel.aggregate<MediaFileDocument>([
        {
          $lookup: {
            from: 'users',
            let: { user: '$user' },
            pipeline: [
              { $match: { $expr: { $eq: ['$$user', '$_id'] } } },
              { $project: { avatar: 1, displayName: 1 } },
            ],
            as: 'user',
          },
        },
        // {
        //   $lookup: {
        //     from: 'groups',
        //     let: {
        //       group: '$group',
        //     },
        //     pipeline: [
        //       {
        //         $match: {
        //           $expr: {
        //             $and: [
        //               { $eq: ['$_id', '$$group'] },
        //               {
        //                 $or: [
        //                   { $eq: ['$admin_id', Types.ObjectId(userId)] },
        //                   { $in: [Types.ObjectId(userId), '$member'] },
        //                   { $eq: ['$privacy', Privacy.Public] },
        //                 ],
        //               },
        //             ],
        //           },
        //         },
        //       },
        //       { $project: { name: 1, backgroundImage: 1 } },
        //     ],
        //     as: 'group',
        //   },
        // },
        {
          $match: {
            type: File.Image,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ]);
      const project = {
        $project: {
          user: { $arrayElemAt: ['$user', 0] },
          // group: { $arrayElemAt: ['$group', 0] },
          type: 1,
          des: 1,
          url: 1,
          createdAt: 1,
        },
      };
      const videos = await paginate(
        query,
        {
          perPage: VIDEOS_PERPAGE,
          page: page,
        },
        project,
      );

      return {
        items: videos.items.map((i) =>
          this.mapsHelper.mapToMediaFileDto(i as unknown as MediaFileDocument),
        ),
        meta: videos.meta,
      };
    } catch (error) {
      console.log(error);
    }
  }
}
