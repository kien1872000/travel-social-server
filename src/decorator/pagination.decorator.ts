import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PaginateOptions } from '@util/types';

export const PaginateQuery = createParamDecorator(
  (perPage: number, ctx: ExecutionContext): PaginateOptions => {
    const request = ctx.switchToHttp().getRequest();
    const result = new PaginateOptions();
    result.page =
      !request.query.page || Number(request.query.page) < 0
        ? 0
        : Number(request.query.page);
    result.perPage =
      !request.query.perPage || Number(request.query.perPage < 1)
        ? Number(perPage)
        : Number(request.query.perPage);
    return result;
  },
);
