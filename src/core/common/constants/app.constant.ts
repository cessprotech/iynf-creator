import { ConfigService } from "@nestjs/config";

export const ENVIRONMENT = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  TEST: 'test',
};

export const ENV_VARS = {
  NODE_ENV: process.env.NODE_ENV,
};

export const STATUS = {
  SUCCESS: 'SUCCESS',

  FAILED: 'FAILED',

  ERROR: 'ERROR',
};

export const PROVIDERS = {
  DB_CONNECT: 'DB_CONNECT',
  MessageService: 'MessageService',
  CachingService: 'CachingService',
};

export const CONFIG = {
  DATABASE: 'database',

  HOST: 'HOST',

  PORT: 'PORT',
};

export const TYPES = {
  STRING: 'string',
};

export const REQUEST_METHODS = {
  GET: 'GET',

  CLIENT: 'CLIENT',

  PUT: 'PUT',

  PATCH: 'PATCH',

  DELETE: 'DELETE',
};

export const APP_CONFIG = {
  APP_NAME: 'APP_NAME',

  APP_VERSION: 'APP_VERSION',

  APP_DESCRIPTION: 'APP_DESCRIPTION',

  DOCS_ROUTE: 'DOCS_ROUTE',
};

export const configService = new ConfigService();
