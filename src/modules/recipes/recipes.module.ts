import { Module } from '@nestjs/common';

import { DateScalar } from '../../core/scalars/date.scalar';
import { BetterAuthModule } from '../../infra/better-auth/better-auth.module';

import { RecipesResolver } from './recipes.resolver';
import { RecipesService } from './recipes.service';

@Module({
  imports: [BetterAuthModule],
  providers: [RecipesResolver, RecipesService, DateScalar],
})
export class RecipesModule {}
