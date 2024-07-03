import { applyDecorators, UseFilters, UseInterceptors } from '@nestjs/common';
import { IApplyDecorator } from '@core/common/interfaces';
import { ResponseFilter } from './response.filter';
import { ResponseDefaultInterceptor } from './response.default.interceptor';
import { ResponsePagingInterceptor } from './response.paging.interceptor';
import { MongooseExceptionFilter } from '@core/common/filters';
import { HttpValidationFilter } from '@core/common/filters';

//default response decorator
export function Response(messagePath?: string): IApplyDecorator {
  return applyDecorators(
    UseInterceptors(ResponseDefaultInterceptor(messagePath)),
    UseFilters(ResponseFilter, MongooseExceptionFilter, HttpValidationFilter),
  );
}

export function ResponsePaging(messagePath: string): IApplyDecorator {
  return applyDecorators(
    UseInterceptors(ResponsePagingInterceptor(messagePath)),
    UseFilters(ResponseFilter),
  );
}
