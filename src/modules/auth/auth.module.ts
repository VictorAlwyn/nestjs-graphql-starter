import { Module } from '@nestjs/common';

import { BetterAuthModule } from '../../infra/better-auth/better-auth.module';
import { EmailModule } from '../../infra/email/email.module';

import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { OAuthController } from './oauth.controller';
import { AuthEmailService } from './services/auth-email.service';

@Module({
  imports: [BetterAuthModule, EmailModule],
  providers: [AuthResolver, AuthService, AuthEmailService],
  controllers: [OAuthController],
  exports: [AuthService],
})
export class AuthModule {}
