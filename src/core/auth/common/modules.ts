import * as session from 'express-session';
import { APP_CONFIG } from '@app/app.constants';
import { ConfigService, ConfigType } from '@nestjs/config';
import { DB_CONFIG } from '@core/modules/database';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const MongoStore = require('connect-mongo');

export const corsOptions = {
  origin: true,

  credentials: true,

  allowHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'X-Access-Token',
    'Authorization',
  ],

  exposedHeaders: ['Content-Range', 'X-Content-Range', 'Set-Cookie', 'Authorization'],
};

export const sessionParams = (): session.SessionOptions => {
  const configService = new ConfigService();
  const dbconfig: ConfigType<typeof DB_CONFIG> = DB_CONFIG()
  const mongoStoreOptions = {
    mongoUrl: dbconfig.DB_CLOUD,
    crypto: {
      secret: configService.get(APP_CONFIG.MONGO_STORE_SECRET),
    },
    ttl: +configService.get(APP_CONFIG.MONGO_STORE_TTL),
  };

  const environment = configService.get(APP_CONFIG.NODE_ENV) === 'production';

  return {
    secret: configService.get(APP_CONFIG.EXPRESS_SESSION_SECRET),

    name: configService.get(APP_CONFIG.EXPRESS_SESSION_NAME),

    cookie: {
      httpOnly: environment,

      secure: environment,

      sameSite: environment ? 'none' : 'lax',

      maxAge: +configService.get(APP_CONFIG.EXPRESS_COOKIE_MAX_AGE), // Time in milliseconds
    },

    saveUninitialized: false,

    resave: false,

    // proxy: true,

    store: MongoStore.create(mongoStoreOptions),

    unset: 'destroy',
  };
};
