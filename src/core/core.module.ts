import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import config from '../config/env.config';
import { JwtAuthGuard } from '../infra/jwt/guards/jwt-auth.guard';

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
    GraphQLConfigModule,
    LoggerModule,
    SecurityModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class CoreModule {}
