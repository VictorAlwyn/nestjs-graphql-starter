import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, type MercuriusDriverConfig } from '@nestjs/mercurius';
import { DatabaseModule } from './infra/database/database.module';
import { CoreModule } from './core/core.module';
import { RecipesModule } from './modules/recipes/recipes.module';

@Module({
  imports: [
    CoreModule,
    DatabaseModule,
    RecipesModule,
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      autoSchemaFile: 'schema.gql',
      subscription: true,
      graphiql: true,
    }),
  ],
})
export class AppModule {}
