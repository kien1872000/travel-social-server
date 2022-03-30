import { AuthModule } from '@auth/auth.module';
import { ChatsModule } from '@chat/chat.module';
import {
  ConnectedSocket,
  ConnectedSocketSchema,
} from '@entity/connected-socket.entity';
import { StringHandlersHelper } from '@helper/string-handler.helper';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConnectedSocketsGateWay } from './connected-sockets.gateway';
import { ConnectedSocketsService } from './connected-sockets.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ConnectedSocket.name,
        schema: ConnectedSocketSchema,
      },
    ]),
    AuthModule,
    forwardRef(() => ChatsModule),
  ],
  providers: [
    ConnectedSocketsService,
    StringHandlersHelper,
    ConnectedSocketsGateWay,
  ],
  exports: [ConnectedSocketsService],
})
export class ConnectedSocketsModule {}
