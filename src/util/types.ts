import { Types } from 'mongoose';

export class JwtPayLoad {
  _id: Types.ObjectId;
  isActive: boolean;
}

export class PaginationRes<T> {
  items: T[];
  meta: {
    perPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export class PaginateOptions {
  perPage: number;
  page: number;
}
