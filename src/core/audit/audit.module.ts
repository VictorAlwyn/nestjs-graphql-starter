import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../infra/database/database.module';

import { AuditService } from './audit.service';
import { RateLimitService } from './rate-limit.service';

@Module({
  imports: [DatabaseModule],
  providers: [AuditService, RateLimitService],
  exports: [AuditService, RateLimitService],
})
export class AuditModule {}
