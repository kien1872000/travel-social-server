import { ChatsModule } from '@chat/chat.module';
import { CommentsModule } from '@comment/comments.module';
import { LikesModule } from '@like/likes.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { InterestsModule } from './module/interests/interests.module';
import { NotificationsModule } from './module/notifications/notifications.module';
import { PlacesModule } from './module/places/places.module';
import { PostsModule } from './module/posts/posts.module';
import { SearchsModule } from './module/searchs/searchs.module';
import { SuggestionsModule } from './module/suggestions/suggestions.module';
import { UsersModule } from './module/users/users.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return configService.getMongoOption();
      },
      inject: [ConfigService],
    }),
    UsersModule,
    PostsModule,
    LikesModule,
    CommentsModule,
    NotificationsModule,
    ChatsModule,
    PlacesModule,
    SearchsModule,
    InterestsModule,
    SuggestionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
