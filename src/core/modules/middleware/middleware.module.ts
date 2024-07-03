import { HelmetMiddleware } from './helmet/helmet.middleware';
import { RateLimitMiddleware } from './rate-limit/rate-limit.middleware';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { CompressionMiddleware } from './compression/compression.middleware';

@Module({})
export class MiddlewareModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    //! middleware
    consumer
      .apply(HelmetMiddleware, RateLimitMiddleware, CompressionMiddleware)
      .forRoutes('*');
  }
}
