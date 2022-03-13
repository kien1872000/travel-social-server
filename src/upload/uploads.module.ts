import { Module } from '@nestjs/common';
import { ConfigModule } from '@config/config.module';
import { UploadsService } from './uploads.service';

@Module({
  imports: [ConfigModule],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
