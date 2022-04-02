import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MediaFile, MediaFileDocument } from '@entity/mediaFile.entity';
import { FileType } from '@entity/post.entity';
import { MapsHelper } from '@helper/maps.helper';
import { StringHandlersHelper } from '@helper/string-handler.helper';
import { UploadsService } from '@upload/uploads.service';
import {
  MEDIA_FILES_PER_PAGE,
  VIDEOS_PERPAGE,
  VIET_NAM_TZ,
} from 'src/util/constants';
import { File, Privacy } from 'src/util/enums';
import { PaginationRes } from '@util/types';
import { MediaFileDto } from '@dto/media-file/media-file.dto';
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
  ): Promise<FileType> {
    try {
      const fileUrl = await this.uploadsService.uploadFile(uploadFile, path);
      const type = uploadFile.mimetype.split('/')[0];
      const newFile = {
        user: new Types.ObjectId(userId),
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

  public async getFiles(
    type: string,
    userId: string,
    page: number,
    perPage: number,
  ): Promise<PaginationRes<MediaFileDto>> {
    const match = { user: Types.ObjectId(userId) };
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
      perPage: perPage,
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
    perPage: number,
  ): Promise<PaginationRes<MediaFileDto>> {
    try {
      const query = this.fileModel
        .find({ type: File.Video })
        .select(['-__v', '-updatedAt', '-_id'])
        .populate('user', ['displayName', 'avatar'])
        .sort('-createdAt');
      const videos = await paginate(query, { page: page, perPage });
      return {
        items: videos.items.map((i) =>
          this.mapsHelper.mapToMediaFileDto(i as unknown as MediaFileDocument),
        ),
        meta: videos.meta,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
