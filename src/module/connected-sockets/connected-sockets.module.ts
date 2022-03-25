import {
  ConnectedSocket,
  ConnectedSocketSchema,
} from '@entity/connected-socket.entity';
import { StringHandlersHelper } from '@helper/string-handler.helper';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConnectedSocketsService } from './connected-sockets.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ConnectedSocket.name,
        schema: ConnectedSocketSchema,
      },
    ]),
  ],
  providers: [ConnectedSocketsService, StringHandlersHelper],
  exports: [ConnectedSocketsService],
})
export class ConnectedSocketsModule {}
