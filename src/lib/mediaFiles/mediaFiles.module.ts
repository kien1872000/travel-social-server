import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaFile, MediaFileSchema } from 'src/entity/mediaFile.entity';
import { MapsHelper } from 'src/helper/maps.helper';
import { StringHandlersHelper } from 'src/helper/stringHandler.helper';
import { UploadsModule } from 'src/uploads/uploads.module';
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
