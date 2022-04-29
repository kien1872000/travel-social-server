import { Like, LikeSchema } from '@entity/like.entity';
import { FollowingsModule } from '@following/followings.module';
import { StringHandlersHelper } from '@helper/string-handler.helper';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from '@entity/post.entity';

import { LikesController } from './controllers/likes.controller';
import { LikesService } from './providers/likes.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Like.name,
        schema: LikeSchema,
      },
      {
        name: Post.name,
        schema: PostSchema,
      },
    ]),

    FollowingsModule,
  ],
  providers: [LikesService, StringHandlersHelper],
  controllers: [LikesController],
  exports: [LikesService],
})
export class LikesModule {}
