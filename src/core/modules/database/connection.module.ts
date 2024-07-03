import { ConfigService, ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DBConfigService } from './dbconfig.service';
import { DB_CONFIG } from './database.config';

/**
 * @description module to create mongodb connection to be imported in parent module
 */

export const DB_CONNECTION = MongooseModule.forRootAsync({
  imports: [ConfigModule.forFeature(DB_CONFIG)],
  useClass: DBConfigService,
  inject: [ConfigService]
});