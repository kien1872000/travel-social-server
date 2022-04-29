import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchema, Comment } from '@entity/comment.entity';
import { StringHandlersHelper } from '@helper/string-handler.helper';

import { CommentsController } from './controllers/comments.controller';
import { CommentsService } from './providers/comments.service';
import { MapsHelper } from '@helper/maps.helper';
import { Post, PostSchema } from '@entity/post.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Comment.name,
        schema: CommentSchema,
      },
      {
        name: Post.name,
        schema: PostSchema,
      },
    ]),
  ],
  providers: [CommentsService, StringHandlersHelper, MapsHelper],
  controllers: [CommentsController],
  exports: [CommentsService],
})
export class CommentsModule {}
