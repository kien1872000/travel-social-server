import { HashtagsModule } from '@hashtag/hashtags.module';
import { Module } from '@nestjs/common';
import { PostsModule } from '@post/posts.module';
import { UsersModule } from '@user/users.module';
import { PlacesModule } from '../places/places.module';
import { SearchsController } from './searchs.controller';
import { SearchsService } from './searchs.service';

@Module({
  imports: [HashtagsModule, PostsModule, UsersModule, PlacesModule],
  providers: [SearchsService],
  controllers: [SearchsController],
})
export class SearchsModule {}
