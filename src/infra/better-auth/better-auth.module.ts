import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuditModule } from '../../core/audit/audit.module';

import { BetterAuthGuard } from './better-auth.guard';
import { BetterAuthService } from './better-auth.service';

@Module({
  imports: [ConfigModule, AuditModule],
  providers: [BetterAuthService, BetterAuthGuard],
  exports: [BetterAuthService, BetterAuthGuard],
})
export class BetterAuthModule {}
