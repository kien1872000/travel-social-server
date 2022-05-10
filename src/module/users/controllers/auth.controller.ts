import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Put,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtRefreshTokenAuthGuard } from '@auth/jwt.refreshtoken-auth.guard';
import { LocalAuthGuard } from '@auth/local-auth.guard';
import { User } from '@decorator/user.decorator';
import {
  ActivationInput,
  SendActivationCodeInput,
} from '@dto/user/activation.dto';
import { LoginAddressDto, LoginInput } from '@dto/user/login.dto';
import { PasswordResetInput } from '@dto/user/passwordReset.dto';
import { RefreshTokenInput } from '@dto/user/refreshToken.dto';
import { RegisterAddress, UserSignUp } from '@dto/user/userSignup.dto';
import { JwtPayLoad } from '@util/types';
import { UsersAuthService } from '../providers/users-auth.service';

@ApiTags('Auth')
@Controller('user/auth')
export class UsersAuthController {
  constructor(private usersAuthService: UsersAuthService) { }

  @Post('loginWalletAddress')
  @ApiOperation({ summary: 'Login' })
  @ApiBody({
    type: LoginAddressDto,
  })
  async loginAddress(@Body() loginDto: LoginAddressDto) {
    return await this.usersAuthService.addressLogin(loginDto);
  }

  @Post('registerWalletAddress')
  @ApiOperation({ summary: 'Register' })
  @ApiBody({
    type: RegisterAddress,
  })
  async register(@Body() registerDto: RegisterAddress) {
    return await this.usersAuthService.addressRegister(registerDto);
  }

  @Post('signup')
  @ApiOperation({ description: 'Đăng kí tài khoản mới' })
  @ApiBody({ type: UserSignUp })
  async signUp(@Body() userSignUp: UserSignUp) {
    return this.usersAuthService.signUp(userSignUp);
  }
  async setTimeoutPromise(timeout) {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  }
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ description: 'Đăng nhập' })
  @ApiBody({ type: LoginInput })
  async login(@User() user: JwtPayLoad) {
    return this.usersAuthService.login(user);
  }
  @Put('send/activationCode')
  @ApiOperation({ description: 'Gửi mã kích hoạt tài khoản vào mail' })
  @ApiBody({ type: SendActivationCodeInput })
  async sendActivationCode(
    @Body() sendActivationCode: SendActivationCodeInput,
  ) {
    return this.usersAuthService.sendActivationCode(sendActivationCode.email);
  }
  @Put('activate-account')
  @ApiOperation({ description: 'Kích hoạt tài khoản' })
  @ApiBody({ type: ActivationInput })
  async activateAccount(@Body() activationInput: ActivationInput) {
    return this.usersAuthService.activateAccount(activationInput);
  }
  @Put('send/resetlink')
  @ApiOperation({ description: 'Gửi link đổi mật khẩu có chứa token vào mail' })
  @ApiBody({ type: SendActivationCodeInput })
  async sendVerificationCode(
    @Body() sendActivationCode: SendActivationCodeInput,
  ) {
    return this.usersAuthService.sendResetLink(sendActivationCode.email);
  }
  @Put('reset-password')
  @ApiOperation({ description: 'Đặt lại mật khẩu mới' })
  @ApiBody({ type: PasswordResetInput })
  async resetPassword(@Body() passwordResetInput: PasswordResetInput) {
    return this.usersAuthService.resetPassword(passwordResetInput);
  }
  @UseGuards(JwtRefreshTokenAuthGuard)
  @ApiBody({ type: RefreshTokenInput })
  @Put('refreshtoken')
  @ApiOperation({ description: 'Dùng refresh token để lấy access token mới' })
  async refreshToken(@User() user: JwtPayLoad) {
    return this.usersAuthService.login(user);
  }
}
