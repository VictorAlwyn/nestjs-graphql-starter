import { Module } from '@nestjs/common';
import { DateScalar } from '../../core/scalars/date.scalar';
import { RecipesResolver } from './recipes.resolver';
import { RecipesService } from './recipes.service';

@Module({
  providers: [RecipesResolver, RecipesService, DateScalar],
})
export class RecipesModule {}
