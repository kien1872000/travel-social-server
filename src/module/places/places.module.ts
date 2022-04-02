import { Place, PlaceSchema } from '@entity/place.entity';
import { UserPlace, UserPlaceSchema } from '@entity/user-place.entity';
import { forwardRef, Module } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { GoongMapModule } from 'src/goong-map/goong-map.module';
import { PlacesController } from './controllers/places.controller';
import { PlacesService } from './providers/places.service';
import { VisitedPlacesService } from './providers/visited-places.service';
import { UserPlacesService } from './providers/user-places.service';
import { StringHandlersHelper } from '@helper/string-handler.helper';
import { PostsModule } from '@post/posts.module';
import { DiscoveryPlacesService } from './providers/discovery-places.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Place.name,
        schema: PlaceSchema,
      },
      {
        name: UserPlace.name,
        schema: UserPlaceSchema,
      },
    ]),
    GoongMapModule,
    forwardRef(() => PostsModule),
  ],
  providers: [
    PlacesService,
    UserPlacesService,
    VisitedPlacesService,
    DiscoveryPlacesService,
    StringHandlersHelper,
  ],
  controllers: [PlacesController],
  exports: [PlacesService],
})
export class PlacesModule {}
