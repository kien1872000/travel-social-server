import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Hashtag, HashtagSchema } from '@entity/hastag.entity';
import { StringHandlersHelper } from '@helper/string-handler.helper';
import { HashtagsService } from './hashtags.service';
import { UploadsModule } from '@upload/uploads.module';
import { InterestsModule } from '../interests/interests.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Hashtag.name,
        schema: HashtagSchema,
      },
    ]),
    InterestsModule,
  ],
  providers: [HashtagsService, StringHandlersHelper],
  exports: [HashtagsService],
})
export class HashtagsModule {}
