import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from 'src/module/users/providers/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayLoad } from 'src/util/types';
import * as randToken from 'rand-token';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

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
