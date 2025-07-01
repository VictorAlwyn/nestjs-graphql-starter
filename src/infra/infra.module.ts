import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email/email.module';
import { HealthModule } from './health/health.module';
import { JwtInfraModule } from './jwt/jwt.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    DatabaseModule,
    EmailModule,
    HealthModule,
    JwtInfraModule,
    QueueModule,
  ],
  exports: [
    DatabaseModule,
    EmailModule,
    HealthModule,
    JwtInfraModule,
    QueueModule,
  ],
})
export class InfraModule {}
