import { ConfigModule } from '@config/config.module';
import { Module } from '@nestjs/common';
import { GoongMapService } from './goong-map.service';

@Module({
  imports: [ConfigModule],
  providers: [GoongMapService],
  exports: [GoongMapService],
})
export class GoongMapModule {}
