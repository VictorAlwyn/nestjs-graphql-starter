import { Module } from '@nestjs/common';

import { CoreModule } from './core/core.module';
import { InfraModule } from './infra/infra.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [CoreModule, InfraModule, AuthModule, UserModule],
})
export class AppModule {}
