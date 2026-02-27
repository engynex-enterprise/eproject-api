import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';

@Global()
@Module({
  imports: [
    NestCacheModule.register({
      ttl: 300, // 5 minutes default
      max: 1000, // maximum number of items in cache
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
