import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/module/users/providers/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayLoad, JwtPayLoadWalletaddress } from 'src/util/types';
import * as randToken from 'rand-token';
import { recoverPersonalSignature } from 'eth-sig-util';
import { RegisterAddress } from '@dto/user/userSignup.dto';
import { LoginAddressDto } from '@dto/user/login.dto';
import { Types } from 'mongoose';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async handleLoginAddress(loginAddressDto: LoginAddressDto) {
    try {
      const { walletAddress, signature, email } = loginAddressDto;

      if (!walletAddress || !signature)
        throw new HttpException(
          'Request should have signature and publicAddress',
          HttpStatus.BAD_REQUEST,
        );

      const user = (await this.usersService.findUserByWalletAddress(email, walletAddress)) as any;
      if (!user)
        throw new BadRequestException('User is undefined');

      const recoveredAddr = recoverPersonalSignature({
        data: "LIVERPOOL",
        sig: signature,
      });

      if (recoveredAddr.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new BadRequestException(
          'Signature is not correct.',
        );
      }

      const payload: JwtPayLoadWalletaddress = {
        walletAddress: walletAddress,
        _id: Types.ObjectId(user?.id),
      };
      return {
        accessToken: this.jwtService.sign(payload),
        tokenType: 'bearer',
        payload: payload,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async handleRegisterAddress(registerAddress: RegisterAddress) {
    const { walletAddress, email } = registerAddress;
    const accountFiltered = await this.usersService.findUserByWalletAddress(email, walletAddress);

    if (accountFiltered) {
      throw new HttpException('Wallet address existing.', HttpStatus.BAD_REQUEST);
    }
    await this.usersService.findUserByMailAndUpdateAddress(email, walletAddress);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = (await this.usersService.findUserByMail(email)) as any;
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const result = {
          _id: user._id,
          email: user.email,
          isActive: user.isActive,
          displayName: user.displayName,
        };
        return result;
      }
      return null;
    }
    return null;
  }
  public async login(payload: JwtPayLoad) {
    return {
      refreshToken: await this.generateRefreshToken(payload._id.toString()),
      accessToken: this.jwtService.sign(payload),
    };
  }
  public getPayloadFromAccessToken(token: string): JwtPayLoad {
    try {
      return this.jwtService.verify<JwtPayLoad>(token, {
        secret: process.env.JWT_KEY,
      });
    } catch (error) {
      return null;
    }
  }
  private async generateRefreshToken(userId: string): Promise<string> {
    try {
      const refreshToken = randToken.generate(16);
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 10);
      await this.usersService.updateRefreshToke(
        refreshToken,
        userId,
        expireDate,
      );
      return refreshToken;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
