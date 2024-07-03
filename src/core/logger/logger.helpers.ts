import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { LOG_CONSTANTS } from './logger.constant';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

// dynamic file logger transport creator
export const createLogFile = (location: string): DailyRotateFile =>
  new DailyRotateFile({
    filename: `%DATE%.log`,
    dirname: location,
    datePattern: 'YYYY-MM-DD',
    json: true,
    zippedArchive: true,
    maxSize: LOG_CONSTANTS.max_size,
    maxFiles: LOG_CONSTANTS.max_files,
  });

export const config_transport_console = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.timestamp(),
    nestWinstonModuleUtilities.format.nestLike(),
  ),
});
