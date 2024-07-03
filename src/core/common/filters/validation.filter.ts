import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { IValidation } from '@core/common/interfaces';
import { STATUS } from '@core/common/constants';
import { Logger, LogService } from '@core/logger';
/**
 * @filter
 *
 * @description - exception filter for errors returned by validation pipe
 */

@Catch(HttpException)
export class HttpValidationFilter implements ExceptionFilter {
  @Logger(HttpValidationFilter.name) private readonly logger: LogService;

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest<Request>();

    const response = ctx.getResponse<Response>();

    const status_code = exception.getStatus();

    const status = `${status_code}`.startsWith('2')
      ? STATUS.SUCCESS
      : `${status_code}`.startsWith('4')
      ? STATUS.FAILED
      : STATUS.ERROR;

    const name = exception.message;

    const message = exception.getResponse() as IValidation;

    const messageEval = Array.isArray(message.message)
      ? `\n${message.message.join('\n\n')}`
      : message.message;

    this.logger.error(`\n\nValidation Failed:\n\n ${messageEval}`, {
      message: messageEval,
    });

    response.status(status_code).json({
      status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      name,
      message: messageEval,
    });
  }
}
