import { WinstonModuleAsyncOptions } from 'nest-winston';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

/**
 * @interface ILOGGEROPIONS winston log initialisation options
 */
export interface ILOGGEROPIONS extends WinstonModuleAsyncOptions {
  format: winston.Logform.Format;
  transports: (DailyRotateFile | winston.transports.ConsoleTransportInstance)[];
  defaultMeta: Record<string, any>;
}
