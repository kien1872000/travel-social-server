import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '@auth/auth.module';
import { Activation, ActivationSchema } from 'src/entity/activation.entity';
import {
  PasswordReset,
  PasswordResetSchema,
} from 'src/entity/passwordReset.entity';
import { User, UserSchema } from '@entity/user.entity';
import { MapsHelper } from '@helper/maps.helper';
import { StringHandlersHelper } from '@helper/string-handler.helper';

import { MailModule } from '@mail//mail.module';
import { FollowingsModule } from '../followings/followings.module';
import { MediaFilesModule } from '../media-files/media-files.module';
import { UsersAuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/users.controller';
import { UsersAuthService } from './providers/users-auth.service';
import { UsersService } from './providers/users.service';
import { UsersAddressService } from './providers/users-address.service';
import { UsersAddressController } from './controllers/users-address.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Activation.name,
        schema: ActivationSchema,
      },
      {
        name: PasswordReset.name,
        schema: PasswordResetSchema,
      },
    ]),
    forwardRef(() => AuthModule),
    MailModule,
    MediaFilesModule,
    forwardRef(() => FollowingsModule),
  ],
  controllers: [UsersAuthController, UsersController, UsersAddressController],
  providers: [
    UsersService,
    UsersAuthService,
    StringHandlersHelper,
    MapsHelper,
    UsersAddressService,
  ],
  exports: [UsersService, UsersAuthService],
})
export class UsersModule {}
