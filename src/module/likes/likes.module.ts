import { Like, LikeSchema } from '@entity/like.entity';
import { FollowingsModule } from '@following/followings.module';
import { StringHandlersHelper } from '@helper/stringHandler.helper';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';
import { LikesController } from './controllers/likes.controller';
import { ReactionsService } from './providers/likes.service';

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
  providers: [ReactionsService, StringHandlersHelper],
  controllers: [LikesController],
  exports: [ReactionsService],
})
export class ReactionsModule { }
