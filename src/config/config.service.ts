import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
@Injectable()
export class ConfigService {
  private readonly envConfig: Record<string, string>;
  constructor() {
    const result = dotenv.config();
    if (result.error) {
      this.envConfig = process.env;
    } else {
      this.envConfig = result.parsed;
    }
  }
  public get(key: string) {
    return this.envConfig[key];
  }
  public getMongoOption() {
    return {
      uri: this.get('MONGODB_URI_LOCAL'),
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    };
  }
}
