import { Inject } from '@nestjs/common';
import { LOG_SERVICE } from './logger.constant';

/**
 * @description add a logger for a feature passing the desired context as param
 * @returns Logger
 */

export const loggerPrefixes: string[] = [];

export function Logger(
  context: string,
): (target: Record<string, any>, key: string | symbol, index?: number) => void {
  if (!loggerPrefixes.includes(context)) {
    loggerPrefixes.push(context);
  }

  return Inject(LOG_SERVICE(context));
}
