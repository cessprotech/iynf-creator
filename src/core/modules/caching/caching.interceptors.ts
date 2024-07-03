import {
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    mixin,
    Type,
    Inject,
  } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { CachingService } from './caching.service';
import { Caching } from './caching.decorators';
import { REQUEST_METHODS } from '@core/common/constants';
import { CACHE_DEFAULT_TTL, CACHE_KEYS, CreateCacheModifiedKey } from './caching.constants';
  
  // This interceptor for applying cache (getting and setting cache) success
  export function ApplyCacheInterceptor(): Type<NestInterceptor> {
    class MixinApplyCacheInterceptor
      implements NestInterceptor<Promise<any>>
    {
  
      constructor(@Caching() private cache: CachingService) {}
  
      async intercept(
        context: ExecutionContext,
        next: CallHandler,
      ): Promise<Observable<Promise<any> | string>> {
        //preparing response from current execution  context
        const ctx: HttpArgumentsHost = context.switchToHttp();
  
        const expressResponse = ctx.getResponse<Response>();
  
        const expressRequest = ctx.getRequest<Request>();

        const user = expressRequest.user as Record<string, unknown>;

        let className = context.getClass().name;

        
        return next.handle().pipe(
          map(async (data) => {
            const requestMethod = expressRequest.method;
            const firstKey = CreateCacheModifiedKey(className);

            if (
                requestMethod === REQUEST_METHODS.CLIENT ||
                requestMethod === REQUEST_METHODS.PATCH ||
                requestMethod === REQUEST_METHODS.DELETE
              ) {
                  await this.cache.set({ firstKey, value: true, ttl: CACHE_DEFAULT_TTL })
              }
            return data;
          }),
        );
      }
    }
  
    return mixin(MixinApplyCacheInterceptor);
  }
  
  export function CacheDataInterceptor(
    action: string,
  ): Type<NestInterceptor> {
    class MixinCacheDataInterceptor
      implements NestInterceptor<Promise<any>>
    {
  
      constructor(@Caching() private cache: CachingService) {}
  
      async intercept(
        context: ExecutionContext,
        next: CallHandler,
      ): Promise<Observable<Promise<any> | string>> {
        //preparing response from current execution  context
        const ctx: HttpArgumentsHost = context.switchToHttp();
  
        const expressResponse = ctx.getResponse<Response>();
  
        const expressRequest = ctx.getRequest<Request>();

        const user = expressRequest.user as Record<string, unknown>;

        let className = context.getClass().name;

        let firstKey = `${className}-${action}`;
        let secondKey = {
            query: expressRequest.url,
            resource: className,
            resource_id: 'public'
        };

        if (user !== undefined && action === CACHE_KEYS.FIND_ONE) secondKey.resource_id = `${user._id}`;

        const secondKeyString = JSON.stringify(secondKey);

        let modifiedKey = CreateCacheModifiedKey(className);

        const dataIsModified = await this.cache.get(modifiedKey)

        if (dataIsModified) {
            const keys = {
                find_all: `${className}-${CACHE_KEYS.FIND_ALL}`,
                find_one: `${className}-${CACHE_KEYS.FIND_ONE}`,
                modifiedKey
            }
            await this.cache.del(keys.find_all);
            await this.cache.del(keys.find_one);
            await this.cache.del(keys.modifiedKey);

            // console.log('deleted from cache', firstKey);
        }
        else {
            const value = await this.cache.get(firstKey, secondKeyString);

            if (value !== null && value !== undefined) {
                // console.log('from cache', firstKey, secondKey);
                return of(value);
            }
        }
        
        return next.handle().pipe(
          map(async (data) => {
            // console.log('from database', firstKey, secondKey);

            await this.cache.set({ firstKey, secondKey: secondKeyString, value: data, ttl: CACHE_DEFAULT_TTL })
            return data;
          }),
        );
      }
    }
  
    return mixin(MixinCacheDataInterceptor);
  }