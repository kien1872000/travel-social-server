import { CommentsModule } from '@comment/comments.module';
import { LikesModule } from '@like/likes.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { PostsModule } from './module/posts/posts.module';
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
