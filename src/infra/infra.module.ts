import { Module } from '@nestjs/common';

import { BetterAuthModule } from './better-auth/better-auth.module';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email/email.module';
import { HealthModule } from './health/health.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    DatabaseModule,
    EmailModule,
    HealthModule,
    BetterAuthModule,
    QueueModule,
  ],
  exports: [
    DatabaseModule,
    EmailModule,
    HealthModule,
    BetterAuthModule,
    QueueModule,
  ],
})
export class InfraModule {}
