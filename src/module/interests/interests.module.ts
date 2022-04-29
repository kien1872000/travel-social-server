import { Interest, InterestSchema } from '@entity/interest.entity';
import { Post, PostSchema } from '@entity/post.entity';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { InterestsController } from './interests.controller';
import { InterestsService } from './interests.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Interest.name,
        schema: InterestSchema,
      },
      {
        name: Post.name,
        schema: PostSchema,
      },
    ]),
  ],
  providers: [InterestsService],
  controllers: [InterestsController],
  exports: [InterestsService],
})
export class InterestsModule {}
