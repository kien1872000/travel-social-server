import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export interface JwtPayLoad {
  _id: Types.ObjectId;
  isActive: boolean;
}

export interface JwtPayLoadWalletaddress {
  _id: Types.ObjectId;
  walletAddress: string;
}

export interface PaginationRes<T> {
  items: T[];
  meta: {
    perPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export class PaginateOptions {
  @IsOptional()
  @IsNumber()
  @ApiProperty({
    type: Number,
    name: 'perPage',
    description:
      'Số item mỗi page muốn get, nếu không điền thì sẽ backend sẽ tự dùng constant',
    required: false,
  })
  perPage: number;
  @IsOptional()
  @IsNumber()
  @ApiProperty({
    type: Number,
    name: 'page',
    description: 'Số thứ tự của page, mặc định là 0',
    required: false,
  })
  page: number;
}
