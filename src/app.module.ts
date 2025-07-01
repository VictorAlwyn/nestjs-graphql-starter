import { Module } from '@nestjs/common';

import { CoreModule } from './core/core.module';
import { InfraModule } from './infra/infra.module';
import { AuthModule } from './modules/auth/auth.module';
import { RecipesModule } from './modules/recipes/recipes.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [CoreModule, InfraModule, AuthModule, RecipesModule, UserModule],
})
export class AppModule {}
