import { Place, PlaceSchema } from '@entity/place.entity';
import { UserPlace, UserPlaceSchema } from '@entity/user-place.entity';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GoongMapModule } from 'src/goong-map/goong-map.module';
import { PlacesController } from './controllers/places.controller';
import { PlacesService } from './providers/places.service';
import { UserPlacesService } from './providers/user-places.service';

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
  ],
  providers: [PlacesService, UserPlacesService],
  controllers: [PlacesController],
  exports: [PlacesService],
})
export class PlacesModule {}
