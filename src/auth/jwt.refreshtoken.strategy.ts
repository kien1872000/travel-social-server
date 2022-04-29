import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayLoad } from 'src/util/types';

import { UsersService } from 'src/module/users/providers/users.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refreshtoken',
) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('accessToken'),
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_KEY,
      passReqToCallback: true,
    });
  }

  public async validate(req, payload: JwtPayLoad) {
    try {
      const user = await this.usersService.findUserById(payload._id.toString());
      if (!user) throw new UnauthorizedException();
      if (req.body.refreshToken != user.refreshToken)
        throw new UnauthorizedException();
      if (new Date() > user.refreshTokenExpires)
        throw new UnauthorizedException();
    } catch (error) {
      console.log(error);
    }
    return payload;
  }
}
