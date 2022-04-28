import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaFile, MediaFileSchema } from '@entity/media-file.entity';
import { MapsHelper } from '@helper/maps.helper';
import { StringHandlersHelper } from '@helper/string-handler.helper';
import { UploadsModule } from '@upload/uploads.module';
import { MediaFilesController } from './media-files.controller';
import { MediaFilesService } from './media-files.service';

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
