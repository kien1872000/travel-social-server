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
import { PlacesModule } from '../places/places.module';
import { PostPlaceService } from './providers/post-place.service';
import { PostsSearchService } from './providers/posts-search.service';
import { InterestsModule } from '../interests/interests.module';
import { PostsResultService } from './providers/posts-result.service';

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
    CommentsModule,
    PlacesModule,
    InterestsModule,
  ],
  controllers: [PostsController],
  providers: [
    PostPlaceService,
    PostsService,
    StringHandlersHelper,
    MapsHelper,
    PostDetailService,
    PostsSearchService,
    PostsResultService,
  ],
  exports: [
    PostsService,
    PostDetailService,
    PostPlaceService,
    PostsSearchService,
  ],
})
export class PostsModule {}
