import { Module } from '@nestjs/common';

import { LoggerModule } from '../../core/logger/logger.module';
import { DatabaseModule } from '../../infra/database/database.module';

import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [DatabaseModule, LoggerModule],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
