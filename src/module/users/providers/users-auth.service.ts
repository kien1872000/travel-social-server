import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { RegisterAddress, UserSignUp } from '@dto/user/userSignup.dto';
import { UsersService } from './users.service';
import { AuthService } from '@auth/auth.service';
import { LoginAddressDto, LoginOutput } from '@dto/user/login.dto';
import { JwtPayLoad } from '@util/types';
import { ActivationInput } from '@dto/user/activation.dto';
import {
  PasswordReset,
  PasswordResetDocument,
} from '@entity/password-reset.entity';
import { Activation, ActivationDocument } from 'src/entity/activation.entity';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import {
  ACTIVATION_CODE_EXPIRE,
  RESET_PASSWORD_TOKEN_EXPIRE,
  VIET_NAM_TZ,
} from 'src/util/constants';
import { PasswordResetInput } from 'src/dto/user/passwordReset.dto';
import { MailService } from 'src/mail/mail.service';
import { StringHandlersHelper } from '@helper/string-handler.helper';
import { MapsHelper } from 'src/helper/maps.helper';
@Injectable()
export class UsersAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly stringHandlersHelper: StringHandlersHelper,
    private readonly mapsHelpler: MapsHelper,
    private readonly mailService: MailService,
    @InjectModel(Activation.name)
    private readonly activationModel: Model<ActivationDocument>,
    @InjectModel(PasswordReset.name)
    private readonly passwordResetModel: Model<PasswordResetDocument>,
  ) { }
  public async addressRegister(input: RegisterAddress): Promise<void> {
    try {
      await this.authService.handleRegisterAddress(input)
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async addressLogin(input: LoginAddressDto): Promise<any> {
    try {
      return await this.authService.handleLoginAddress(input)
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async signUp(input: UserSignUp): Promise<void> {
    try {
      const user = await this.usersService.findUserByMail(input.email);
      if (user) {
        throw new ConflictException('Email ???? t???n t???i');
      }
      const salt = await bcrypt.genSalt();
      input.password = await bcrypt.hash(input.password, salt);
      await this.usersService.addNewUser(input);
      //await this.sendActivationCode(input.email);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async login(payload: JwtPayLoad): Promise<LoginOutput> {
    if (!payload.isActive) {
      throw new ForbiddenException('T??i kho???n ch??a ???????c k??ch ho???t');
    }

    const user = await this.usersService.getUserProfile(
      payload._id.toString(),
      payload._id.toString(),
    );
    const token = await this.authService.login(payload);

    return this.mapsHelpler.mapToLoginOutput(
      token.accessToken,
      token.refreshToken,
      user,
    );
  }
  public async sendActivationCode(email: string): Promise<void> {
    const user = await this.usersService.findUserByMail(email);
    if (!user) {
      throw new BadRequestException('Email kh??ng t???n t???i');
    }
    if (user.isActive) {
      throw new BadRequestException('T??i kho???n ???? ???????c k??ch ho???t');
    }
    try {
      dayjs.extend(timezone);
      dayjs.extend(utc);
      const activationCode = this.stringHandlersHelper.generateString(10);
      const expireIn = dayjs()
        .tz(VIET_NAM_TZ)
        .add(ACTIVATION_CODE_EXPIRE, 'day')
        .format();
      await this.activationModel.findOneAndUpdate(
        { email: email },
        { activationCode: activationCode, expireIn: new Date(expireIn) },
        { upsert: true },
      );
      await this.mailService.sendConfirmationEmail(
        email,
        activationCode,
        user.displayName,
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async activateAccount(
    activationInput: ActivationInput,
  ): Promise<void> {
    try {
      dayjs.extend(timezone);
      dayjs.extend(utc);
      const promises = await Promise.all([
        this.activationModel.findOne({
          email: activationInput.email,
        }),
        this.usersService.findUserByMail(activationInput.email),
      ]);
      const activation = promises[0];
      if (!promises[1]) throw new BadRequestException('Kh??ng t???n t???i email');
      if (promises[1].isActive)
        throw new BadRequestException('T??i kho???n ???? ???????c k??ch ho???t');
      if (
        !activation ||
        !(activation.activationCode === activationInput.activationCode)
      ) {
        throw new BadRequestException('K??ch ho???t th???t b???i');
      }
      const now = dayjs().tz(VIET_NAM_TZ);
      const expireDate = dayjs(activation.expireIn).tz(VIET_NAM_TZ);

      if (now.diff(expireDate) >= 0) {
        throw new BadRequestException('K??ch ho???t th???t b???i');
      }
      await this.usersService.activateAccount(activationInput.email);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async sendResetLink(email: string): Promise<void> {
    const user = await this.usersService.findUserByMail(email);
    if (!user) throw new BadRequestException('Email kh??ng t???n t???i');
    try {
      dayjs.extend(timezone);
      dayjs.extend(utc);
      const token = this.stringHandlersHelper.generateString(60);
      const expireIn = dayjs()
        .tz(VIET_NAM_TZ)
        .add(RESET_PASSWORD_TOKEN_EXPIRE, 'm')
        .format();

      await this.passwordResetModel.findOneAndUpdate(
        { email: email },
        { token: token, expireIn: new Date(expireIn) },
        { upsert: true },
      );
      await this.mailService.sendPasswordResetEmail(
        email,
        token,
        user.displayName,
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async resetPassword(input: PasswordResetInput): Promise<void> {
    try {
      const promises = await Promise.all([
        this.usersService.findUserByMail(input.email),
        this.passwordResetModel.findOne({ email: input.email }),
      ]);
      const user = promises[0];
      if (!user) throw new BadRequestException('Email kh??ng t???n t???i');
      if (!user.isActive)
        throw new BadRequestException('T??i kho???n ch??a ???????c k??ch ho???t');

      const passwordReset = promises[1];
      if (!passwordReset || !(input.token === passwordReset.token))
        throw new BadRequestException('?????t l???i m???t kh???u th???t b???i');
      dayjs.extend(timezone);
      dayjs.extend(utc);
      const now = dayjs().tz(VIET_NAM_TZ);
      const expireDate = dayjs(passwordReset.expireIn).tz(VIET_NAM_TZ);
      if (now.diff(expireDate) >= 0) {
        throw new BadRequestException('?????t l???i m???t kh???u th???t b???i');
      }
      await Promise.all([
        this.usersService.changePassword((user as any)._id, input.newPassword),
        this.passwordResetModel.findByIdAndDelete((passwordReset as any)._id),
      ]);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
