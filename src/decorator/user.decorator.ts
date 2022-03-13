import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayLoad } from '@util/types';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayLoad => {
    const request = ctx.switchToHttp().getRequest();
    return { _id: request.user._id, isActive: request.user.isActive };
  },
);
