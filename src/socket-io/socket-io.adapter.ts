import { ConfigService } from '@config/config.service';
import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

export class SocketIoAdapter extends IoAdapter {
  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const origin = this.configService.get('CLIENT_BASE_URL');
    options.cors = { origin: origin, credentials: true };
    const server = super.createIOServer(port, options);
    return server;
  }
}
