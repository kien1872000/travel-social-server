import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,

} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class SocketValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    if (!value) throw new WsException({ error: 'Value has not been sent' });

    const object = plainToClass(metatype, value);

    const errors = await validate(object);
    if (errors.length > 0) {
      const error = {
        error: 'Validation failed',
        message: errors.map((i) => i.constraints),
      };
      throw new WsException(error);
    }
    return value;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private toValidate(metatype: Function): boolean {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
