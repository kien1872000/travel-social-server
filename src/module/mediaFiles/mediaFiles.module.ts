import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaFile, MediaFileSchema } from '@entity/mediaFile.entity';
import { MapsHelper } from '@helper/maps.helper';
import { StringHandlersHelper } from '@helper/stringHandler.helper';
import { UploadsModule } from '@upload/uploads.module';
import { MediaFilesController } from './mediaFiles.controller';
import { MediaFilesService } from './mediaFiles.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MediaFile.name,
        schema: MediaFileSchema,
      },
    ]),
    UploadsModule,
  ],
  controllers: [MediaFilesController],
  providers: [MediaFilesService, StringHandlersHelper, MapsHelper],
  exports: [MediaFilesService],
})
export class MediaFilesModule {}
