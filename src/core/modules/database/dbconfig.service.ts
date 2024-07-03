import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ENVIRONMENT } from '@core/common/constants';
import { DB_CONFIG } from './database.config';

import {
  MongooseOptionsFactory,
  MongooseModuleOptions,
} from '@nestjs/mongoose';

/**
 * @description service to set mongoose connection options
 *
 * @return {object} Connection Options
 */

@Injectable()
export class DBConfigService implements MongooseOptionsFactory {
  constructor(
    @Inject(DB_CONFIG.KEY) private dbconfig: ConfigType<typeof DB_CONFIG>,
  ) {}

  createMongooseOptions(): MongooseModuleOptions {
    const { DB_NAME, DB_LOCAL, DB_CLOUD, DB_PASSWORD } = this.dbconfig;

    //getting and preparing database variables and keys
    // const DB = DB_CLOUD.replace('<password>', DB_PASSWORD).replace(
    //   '<dbname>',
    //   DB_NAME,
    // );

    //conditionally use connection string according to environmental
    const CONNECTION_URI =
      process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT ? DB_LOCAL : DB_CLOUD;

    // console.log(CONNECTION_URI, 'CONNECT');
    //mongoose connection options
    return {
      uri: CONNECTION_URI,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      keepAlive: true,
      family: 4, // Use IPv4, skip trying IPv6
      connectionFactory: (connection) => {
        connection.plugin(require('mongoose-paginate-v2'));
        return connection;
      }
    };
  }
}
