import { applyDecorators, Inject, UseFilters, UseInterceptors } from '@nestjs/common';
import { IApplyDecorator } from '@core/common/interfaces';
import { CacheDataInterceptor, ApplyCacheInterceptor } from './caching.interceptors';
import { CachingService } from './caching.service';
import { PROVIDERS } from '@core/common/constants';

//default response decorator
export function CacheData(action: string): IApplyDecorator {
  return applyDecorators(
    UseInterceptors(CacheDataInterceptor(action)),
  );
}
export function ApplyCache(): IApplyDecorator {
  return applyDecorators(
    UseInterceptors(ApplyCacheInterceptor()),
  );
}

export function Caching(): (target: Record<string, any>, key: string | symbol, index?: number) => void {
    
    return Inject(CachingService);
  }



