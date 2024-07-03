import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as session from 'express-session';
import { AppModule } from './app';
import { HttpExceptionFilter } from '@core/common/filters';
import { VALIDATION_RULE } from '@core/common/constants';
import { APP_CONFIG } from './app/app.constants';
import { LogService } from '@core/logger';
import { Error } from 'mongoose';
import { ShutdownService } from '@app/power.service';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { corsOptions } from '@core/auth/common/modules';
import * as Sentry from '@sentry/node';

/**
 * @desc - Starts the application, assembly point of all the modules
 */
async function bootstrap() {
  //application execution port

  //logger instance  - No dependency injection
  const logger = new LogService();

  const app = await NestFactory.create(AppModule, {
    logger,
  });

  // Global Prefix
  app.setGlobalPrefix('/api/v1/creators');
  //fetching config service to get env variables
  // const conf = new ConfigService();

  const config_service = new ConfigService()

  const PORT = config_service.get<number>(APP_CONFIG.PORT);
  const HOST = config_service.get<string>(APP_CONFIG.HOST);

  const SENTRY_DSN = config_service.get<string>(APP_CONFIG.SENTRY_DSN);

  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN
    });
  }

  //Use this in production
  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  //   AppModule,
  //   {
  //     transport: Transport.RMQ,
  //     options: {
  //       urls: [`${config_service.get(APP_CONFIG.RMQ_URI)}`],
  //       queue: `${config_service.get(APP_CONFIG.RMQ_EVENT_QUEUE)}`,
  //       queueOptions: { durable: false },
  //       persistent: true
  //     },
  //   },
  // );
  
  app.connectMicroservice(
    {
      transport: Transport.RMQ,
      options: {
        urls: [`${config_service.get(APP_CONFIG.RMQ_URI)}`],
        queue: `${config_service.get(APP_CONFIG.RMQ_CREATOR_QUEUE)}`,
        queueOptions: { durable: false },
        persistent: true
      },
    },
  );

  //Nest application artifect creation
  
  // const HOST = config_service.get<string>(CONFIG.HOST);


  // const AUTH_TYPE = config_service.get<string>(APP_CONFIG.AUTH_TYPE)

  // const APP_NAME = config_service.get<string>(APP_CONFIG.APP_NAME);

  // const APP_VERSION = config_service.get<string>(APP_CONFIG.APP_VERSION);

  // const DOCS_ROUTE = config_service.get<string>(APP_CONFIG.DOCS_ROUTE);

  // const APP_DESCRIPTION = config_service.get<string>(
  //   APP_CONFIG.APP_DESCRIPTION,
  // );

  //applying global pipe to application
  app.useGlobalPipes(new ZodValidationPipe());

  //using global filters - exception handling
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors(corsOptions);


  //TODO: move options to config module and refactor
  //configure docs builder options
  // const options = new DocumentBuilder()
  //   .setTitle(APP_NAME)
  //   .setDescription(APP_DESCRIPTION)
  //   .setVersion(APP_VERSION)
  //   .build();

  // const document = SwaggerModule.createDocument(app, options);

  // SwaggerModule.setup(DOCS_ROUTE, app, document);

  //log messages on application init
  logger.log(`ℹℹℹ LISTENING TO EVENT MICROSERVICE ${HOST}:${PORT} ON PORT ${PORT} ℹℹℹ`);

  //log authentication type
  // logger.log(`ℹℹℹ AUTHENTICATION TYPE(JWT | SSA): ${AUTH_TYPE} ℹℹℹ`)

  //getting the application shutdown service
  const power = app.get(ShutdownService);

  // Subscribe to your service's shutdown event, run app.close() when emitted
  power.prepareToShutdown(async () => await app.close());

  await app.startAllMicroservices();

  //listen to port for requests
  await app.listen(PORT);

  //handling uncaughtExceptions
  process.on('uncaughtException', (err: Error) => {
    power.handleExceptions(err);
  });

  //handling unhandledRejection
  process.on('unhandledRejection', (err: Error) => {
    power.handleRejections(err);
  });
}

//run
bootstrap();
