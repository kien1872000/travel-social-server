import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailProcessor } from './mail.processor';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@config/config.module';
import { ConfigService } from '@config/config.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST'),
          port: configService.get('MAIL_PORT'),
          secure: true,
          auth: {
            user: configService.get('MAIL_USERNAME'),
            pass: configService.get('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: {
            name: configService.get('APP_NAME'),
            address: configService.get('MAIL_USERNAME'),
          },
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: 'mail',
      useFactory: (configService: ConfigService) => ({
        redis: {
          path: 'redis://:p350729242e65614349d96bfdbf01ef99d5a072e2eb00a33f02be0b9a6fc01074@ec2-54-163-171-22.compute-1.amazonaws.com:25239',

          // host: 'ec2-54-163-171-22.compute-1.amazonaws.com',
          // port: 25240,
          // password:
          //   'p350729242e65614349d96bfdbf01ef99d5a072e2eb00a33f02be0b9a6fc01074',
        },
      }),
    }),
  ],
  controllers: [],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
