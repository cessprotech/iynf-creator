import { Provider } from '@nestjs/common';
import { LogService } from '.';
import { LOG_SERVICE } from './logger.constant';
import { loggerPrefixes } from './logger.decorator';

//set logger context
const loggerFactory = (logger: LogService, context: string) => {
  if (context) {
    logger.setContext(context);
  }

  return logger;
};

//create provider that serves a logger using param as logger context
const ProvideLogger = (context: string): Provider<LogService> => {
  return {
    provide: LOG_SERVICE(context),

    useFactory: (logger: LogService) => loggerFactory(logger, context),

    inject: [LogService],
  };
};

//array containg all required logger context in app
export const createLoggerProviders = (): Provider<LogService>[] => {
  return loggerPrefixes.map((context) => ProvideLogger(context));
};
