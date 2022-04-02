import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from '@entity/post.entity';
import { MapsHelper } from '@helper/maps.helper';
import { StringHandlersHelper } from '@helper/string-handler.helper';
import { FollowingsModule } from '../followings/followings.module';
import { HashtagsModule } from '../hashtags/hashtags.module';
import { MediaFilesModule } from '../media-files/media-files.module';
import { PostsController } from './controllers/posts.controller';
import { PostsService } from './providers/posts.service';
import { LikesModule } from '@like/likes.module';
import { PostDetailService } from './providers/post-detail.service';
import { CommentsModule } from '@comment/comments.module';
import { PlacesService } from '../places/providers/places.service';
import { PlacesModule } from '../places/places.module';
import { PostPlaceService } from './providers/post-place.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Post.name,
        schema: PostSchema,
      },
    ]),
    MediaFilesModule,
    HashtagsModule,
    LikesModule,
    FollowingsModule,
    forwardRef(() => CommentsModule),
    PlacesModule,
  ],
  controllers: [PostsController],
  providers: [
    PostPlaceService,
    PostsService,
    StringHandlersHelper,
    MapsHelper,
    PostDetailService,
  ],
  exports: [PostsService, PostDetailService, PostPlaceService],
})
export class PostsModule {}
