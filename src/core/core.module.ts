import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import config from '../config/env.config';
import { BetterAuthGuard } from '../infra/better-auth/better-auth.guard';
import { BetterAuthModule } from '../infra/better-auth/better-auth.module';

import { GraphQLConfigModule } from './graphql.module';
import { LoggerModule } from './logger/logger.module';
import { SecurityModule } from './security/security.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    BetterAuthModule,
    GraphQLConfigModule,
    LoggerModule,
    SecurityModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: BetterAuthGuard,
    },
  ],
})
export class CoreModule {}
