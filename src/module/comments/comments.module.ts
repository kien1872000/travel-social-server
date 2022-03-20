import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchema, Comment } from '@entity/comment.entity';
import { StringHandlersHelper } from '@helper/string-handler.helper';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';
import { CommentsController } from './controllers/comments.controller';
import { CommentsService } from './providers/comments.service';
import { MapsHelper } from '@helper/maps.helper';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Comment.name,
        schema: CommentSchema,
      },
    ]),
    forwardRef(() => UsersModule),
    PostsModule,
  ],
  providers: [CommentsService, StringHandlersHelper, MapsHelper],
  controllers: [CommentsController],
  exports: [CommentsService],
})
export class CommentsModule {}
