import { Pool, PoolSchema } from '@entity/pool.entity';
import { HashtagsModule } from '@hashtag/hashtags.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsModule } from '@post/posts.module';
import { UsersModule } from '@user/users.module';
import { PlacesModule } from '../places/places.module';
import { PoolController } from './pool.controller';
import { PoolService } from './pool.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Pool.name,
        schema: PoolSchema,
      }
    ]),
    HashtagsModule, PostsModule, UsersModule, PlacesModule],
  providers: [PoolService],
  controllers: [PoolController],
})
export class PoolModule { }
