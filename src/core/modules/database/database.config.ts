import { Injectable } from '@nestjs/common';
import * as Joi from 'joi';
import { InjectConfigValidation } from '@core/config';

/**
 * @description environmental variables required in .env file to properly run db module
 */
@Injectable()
class AppEnv {
  DB_CLOUD = Joi.string().required();
  DB_LOCAL = Joi.string().required();
  DB_PASSWORD = Joi.string().optional();
  DB_NAME = Joi.string().optional();
}

export const DB_CONFIG = InjectConfigValidation<AppEnv>('database', new AppEnv());
