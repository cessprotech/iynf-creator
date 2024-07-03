import { DynamicModule, Global } from '@nestjs/common';
import { createLoggerProviders } from './logger.provider';
import { LogService } from './logger.service';

/**
 * @global
 * @module LogService -  application logging service
 * @exports LogService
 */
@Global()
export class LogModule {
  static forRoot(): Promise<DynamicModule> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const loggerProviders = createLoggerProviders();

        resolve({
          module: LogModule,
          providers: [LogService, ...loggerProviders],
          exports: [LogService, ...loggerProviders],
        });
      }, 0);
    });
  }
}
