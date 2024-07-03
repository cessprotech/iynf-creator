import { Module } from '@nestjs/common';
// import { WinstonModule } from 'nest-winston';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LogModule } from '@core/logger';
import { MessageModule } from '@core/modules/message';
// import { MiddlewareModule } from '@libs/modules/middleware';
import { EventEmitModule } from '@core/modules/event-emitter';

import { CONFIG_VALIDATORS } from '@core/config';
import { APP_ENV } from './app.config';
import { DB_CONNECTION, MODEL_INJECT } from '@core/modules/database';
import { ShutdownService } from './power.service';
// import { CachingModule } from '@libs/modules/caching/caching.module';
import { MicroServicesConfig } from './config.service';
import { CreatorModel } from './app.schema';
import { ExternalModels } from './schema/externals.schema';
import { MeController } from './me.controller';
import { SentryInterceptor } from '@core/common/interceptors/sentry.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JobMController } from './jobs/job.m.controller';
import { JobService } from './jobs/job.service';
import { JobModel } from './jobs/job.schema';
import { HiredModel } from './jobs/hired.schema';
import { JobController } from './jobs/job.controller';
import { InfluencerMService } from './mservices/influencer.m.service';
import { JobRequestModel } from './jobs/request.schema';

@Module({
  imports: [
    DB_CONNECTION,

    MODEL_INJECT([ CreatorModel, JobModel, HiredModel, JobRequestModel, ...ExternalModels ]),

    LogModule.forRoot(),

    ConfigModule.forRoot({
      load: [APP_ENV],
      envFilePath: process.env.NODE_ENV === 'production' ? '.env' : 'dev.env',
      validationSchema: CONFIG_VALIDATORS,
      cache: true,
      isGlobal: true,
    }),

    MicroServicesConfig(),

    // MiddlewareModule,

    MessageModule,    
    //features
    EventEmitModule,

  ],

  controllers: [AppController, MeController, JobController, MeController, JobMController],

  providers: [AppService, ShutdownService, JobService, InfluencerMService,
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor
    }
  ],
})
export class AppModule {}
