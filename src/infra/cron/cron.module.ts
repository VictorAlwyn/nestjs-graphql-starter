import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { PgBossModule } from '../pg-boss/pg-boss.module';

import { CronService } from './services/cron.service';

@Global()
@Module({
  imports: [ScheduleModule.forRoot(), PgBossModule],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
