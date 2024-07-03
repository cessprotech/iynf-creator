import { APP_CONFIG } from '@app/app.constants';
import { PROVIDERS } from '@core/common/constants';
import { CacheModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { CachingService } from './caching.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          store: redisStore.create({
            url: configService.get(APP_CONFIG.REDIS_CLOUD),
          }),
          ttl: 3600
        }
      },
      inject: [ConfigService],
      }),
  ],
  providers: [
    CachingService
  ],
  exports: [CachingService]
})
export class CachingModule {}
