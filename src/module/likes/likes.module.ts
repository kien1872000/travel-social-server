import { Like, LikeSchema } from '@entity/like.entity';
import { FollowingsModule } from '@following/followings.module';
import { StringHandlersHelper } from '@helper/stringHandler.helper';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';
import { LikesController } from './controllers/likes.controller';
import { LikesService } from './providers/likes.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Like.name,
        schema: LikeSchema,
      },
    ]),
    forwardRef(() => UsersModule),
    PostsModule,
    FollowingsModule,
   
  ],
  providers: [LikesService, StringHandlersHelper],
  controllers: [LikesController],
  exports: [LikesService],
})
export class ReactionsModule { }
