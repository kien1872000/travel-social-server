import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Hashtag, HashtagSchema } from '@entity/hastag.entity';
import { StringHandlersHelper } from '@helper/string-handler.helper';
import { HashtagsService } from './hashtags.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Hashtag.name,
        schema: HashtagSchema,
      },
    ]),
  ],
  providers: [HashtagsService, StringHandlersHelper],
  exports: [HashtagsService],
})
export class HashtagsModule {}
