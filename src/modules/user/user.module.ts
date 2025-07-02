import { Module } from '@nestjs/common';

import { LoggerModule } from '../../core/logger/logger.module';
import { BetterAuthModule } from '../../infra/better-auth/better-auth.module';
import { DatabaseModule } from '../../infra/database/database.module';

import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [BetterAuthModule, DatabaseModule, LoggerModule],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
