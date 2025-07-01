import { Global, Module } from '@nestjs/common';

import { PgBossModule } from '../pg-boss/pg-boss.module';

import { QueueService } from './services/queue.service';
import { EmailQueueWorker } from './workers/email-queue.worker';

@Global()
@Module({
  imports: [PgBossModule],
  providers: [QueueService, EmailQueueWorker],
  exports: [QueueService, EmailQueueWorker],
})
export class QueueModule {}
