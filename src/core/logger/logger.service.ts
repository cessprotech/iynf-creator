import chalk from 'chalk';
import winston from 'winston';
import PrettyError from 'pretty-error';
import { createLogFile } from './logger.helpers';
import { ENVIRONMENT } from '@core/common/constants';
import { NAMESPACE } from '@core/modules/event-emitter';
import { LOGGER_NAME, LEVELS, DEFAULT_CONTEXT } from './logger.constant';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class LogService {
  initLogger(): winston.LoggerOptions | Promise<winston.LoggerOptions> {
    throw new Error('Method not implemented.');
  }
  private readonly prettyError = new PrettyError();

  private context?: string = DEFAULT_CONTEXT;

  constructor() {
    this.prettyError.skipNodeFiles();
    this.prettyError.skipPackage('express', '@nestjs/common', '@nestjs/core');
  }

  log(message: string | object): void {
    if (typeof message === 'object') {
      message = JSON.stringify(message, null, 4);
    }
    winston
      .createLogger({
        level: LEVELS.INFO,
        transports: [
          createLogFile(`logs/${LOGGER_NAME.SYSTEM}/${LEVELS.INFO}`),
        ],
      })
      .info(message, {
        timestamp: new Date().toISOString(),
        context: this.context,
      });

    this.formatedLog(LEVELS.INFO, message);
  }

  logEvent(message: string, event: string | object): void {
    if (typeof event === 'object') {
      event = JSON.stringify(event, null, 4);
    }

    winston
      .createLogger({
        level: LEVELS.INFO,
        transports: [
          createLogFile(`logs/${LOGGER_NAME.EVENTS}/${NAMESPACE.USER}`),
        ],
      })
      .info(message, {
        timestamp: new Date().toISOString(),
        context: this.context,
      });

    this.formatedLog(LEVELS.EVENT, message, event);
  }

  warn(message: string): void {
    winston
      .createLogger({
        level: LEVELS.WARN,
        transports: [
          createLogFile(`logs/${LOGGER_NAME.SYSTEM}/${LEVELS.WARN}`),
        ],
      })
      .warn(message, {
        timestamp: new Date().toISOString(),
        context: this.context,
      });

    this.formatedLog(LEVELS.WARN, message);
  }

  error(message: string, stack?: unknown): void {
    winston
      .createLogger({
        level: LEVELS.ERROR,
        transports: [
          createLogFile(`logs/${LOGGER_NAME.SYSTEM}/${LEVELS.ERROR}`),
        ],
      })
      .error(`${message} -> (${stack || 'trace not provided !'})`, {
        timestamp: new Date().toISOString(),
        context: this.context,
      });

    this.formatedLog(LEVELS.ERROR, message, undefined, stack);
  }

  errorLite(message: string, stack?: unknown): void {
    this.formatedLog(LEVELS.ERROR, message, undefined, stack);
  }

  exception(error?: unknown): void {
    //cast returned exception to error type
    const casterror = error as Error;

    winston
      .createLogger({
        level: LEVELS.ERROR,
        transports: [
          createLogFile(`logs/${LOGGER_NAME.SYSTEM}/${LEVELS.EXCEPTIONS}`),
        ],
      })
      .error(
        `${casterror.name} -> (${casterror.stack || 'trace not provided !'})`,
        {
          message: casterror.message,
          timestamp: new Date().toISOString(),
          context: this.context,
        },
      );
  }

  rejection(error?: unknown): void {
    //cast returned exception to error type
    const casterror = error as Error;

    winston
      .createLogger({
        level: LEVELS.ERROR,
        transports: [
          createLogFile(`logs/${LOGGER_NAME.SYSTEM}/${LEVELS.REJECTIONS}`),
        ],
      })
      .error(
        `${casterror.name} -> (${casterror.stack || 'trace not provided !'})`,
        {
          message: casterror.message,
          timestamp: new Date().toISOString(),
          context: this.context,
        },
      );
  }

  /**
   *
   * @param context desired name for logger context
   */

  setContext(context: string) {
    this.context = context;
  }

  // this method just for printing a cool log in your terminal , using chalk
  private formatedLog(
    level: string,
    message: string | object,
    event?: string | object,
    error?: unknown | undefined,
  ): void {
    let result: string;

    const color = chalk.white;

    const currentDate = new Date();

    const addTrailingZero = (value: number) => {
      if (value >= 10) {
        return value;
      }

      return `0${value}`;
    };

    const time = `${addTrailingZero(currentDate.getHours())}:${addTrailingZero(
      currentDate.getMinutes(),
    )}:${addTrailingZero(currentDate.getSeconds())}`;

    switch (level) {
      case 'info':
        result = `[${color.blue('INFO')}] ${color.dim.yellow.bold.underline(
          time,
        )} [${color.cyan(this.context)}] ${color.greenBright(message)}`;
        break;
      case 'error':
        result = `[${color.red('ERROR')}] ${color.dim.yellow.bold.underline(
          time,
        )} [${color.green(this.context)}] ${message}`;

        if (process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT)
          this.prettyError.render(error, true);
        break;
      case 'warn':
        result = `[${color.yellow('WARN')}] ${color.dim.yellow.bold.underline(
          time,
        )} [${color.green(this.context)}] ${message}`;
        break;
      case 'events':
        result = `[${color.blue('INFO')}] ${color.dim.yellow.bold.underline(
          time,
        )} [${color.cyan('EVENTS')}] ${color.yellow(
          message,
        )} \n\n ${color.magentaBright(event)}`;
        break;
      default:
        break;
    }
    console.log(result);
  }
}
