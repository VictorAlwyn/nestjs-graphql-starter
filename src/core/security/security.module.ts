import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

import { SecurityService } from './security.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      {
        ttl: 3600000, // 1 hour
        limit: 1000, // 1000 requests per hour
      },
    ]),
  ],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}
