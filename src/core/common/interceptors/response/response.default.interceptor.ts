import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  mixin,
  Type,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Message } from '@core/modules/message';
import { MessageService } from '@core/modules/message';
import { REQUEST_METHODS, STATUS } from '@core/common/constants';
import { Logger, LogService } from '@core/logger';

// This interceptor for restructure response success
export function ResponseDefaultInterceptor(
  reply?: string,
): Type<NestInterceptor> {
  class MixinResponseDefaultInterceptor
    implements NestInterceptor<Promise<any>>
  {
    @Logger('DefaultResponseInterceptor') private readonly logger: LogService;

    constructor(@Message() private readonly message_service: MessageService) {}

    async intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Promise<Observable<Promise<any> | string>> {
      //preparing response from current execution  context
      const ctx: HttpArgumentsHost = context.switchToHttp();

      const responseExpress = ctx.getResponse<Response>();

      const requestExpress = ctx.getRequest<Request>().method;

      return next.handle().pipe(
        map(async (response: Promise<Record<string, any>>) => {
          //handle status message dependinng on response code
          const status = `${responseExpress.statusCode}`.startsWith('2')
            ? STATUS.SUCCESS
            : `${responseExpress.statusCode}`.startsWith('4')
            ? STATUS.FAILED
            : STATUS.ERROR;

          // gettin response Payload
          const data: Record<string, any> = await response;

          //get corrensponding message from message service
          const message: string = this.message_service.get(reply);

          //log mutation request success

          if (
            requestExpress === REQUEST_METHODS.CLIENT ||
            requestExpress === REQUEST_METHODS.PATCH ||
            requestExpress === REQUEST_METHODS.DELETE
          ) {
            this.logger.log({ message, data });
          }

          //prepare response and return

          return {
            status,
            message,
            data,
          };
        }),
      );
    }
  }

  return mixin(MixinResponseDefaultInterceptor);
}
