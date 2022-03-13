import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtPayLoad } from 'src/util/types';
import { ConfigService } from 'src/config/config.service';
import { UsersService } from 'src/lib/users/providers/users.service';

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
