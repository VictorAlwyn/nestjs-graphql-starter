import { NotFoundException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';

import { Audit } from '../../core/decorators/audit.decorator';
import { Auth, Public, AdminOnly } from '../../core/decorators/auth.decorators';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { AuditLogAction } from '../../infra/database/schemas/audit-logs.schema';
import { UserModel } from '../user/models/user.model';

import { NewRecipeInput } from './dto/new-recipe.input';
import { RecipesArgs } from './dto/recipes.args';
import { Recipe } from './models/recipe.model';
import { RecipesService } from './recipes.service';

const pubSub = new PubSub();

@Resolver(() => Recipe)
export class RecipesResolver {
  constructor(private readonly recipesService: RecipesService) {}

  @Public()
  @Query(() => Recipe)
  @Audit({ action: AuditLogAction.RECIPE_READ, resource: 'recipe' })
  async recipe(@Args('id') id: string): Promise<Recipe> {
    const recipe = await this.recipesService.findOneById(id);
    if (!recipe) {
      throw new NotFoundException(id);
    }
    return recipe;
  }

  @Public()
  @Query(() => [Recipe])
  @Audit({ action: AuditLogAction.RECIPE_READ, resource: 'recipe' })
  async recipes(@Args() recipesArgs: RecipesArgs): Promise<Recipe[]> {
    return await this.recipesService.findAll(recipesArgs);
  }

  @Auth()
  @Mutation(() => Recipe)
  @Audit({ action: AuditLogAction.RECIPE_CREATE, resource: 'recipe' })
  async addRecipe(
    @Args('input') input: NewRecipeInput,
    @CurrentUser() user: UserModel,
  ): Promise<Recipe> {
    console.log(`Recipe being added by user: ${user.email}`);
    const recipe = await this.recipesService.create(input);
    pubSub.publish('recipeAdded', { recipeAdded: recipe });
    return recipe;
  }

  @AdminOnly()
  @Mutation(() => Boolean)
  @Audit({ action: AuditLogAction.RECIPE_DELETE, resource: 'recipe' })
  async removeRecipe(
    @Args('id') id: string,
    @CurrentUser() user: UserModel,
  ): Promise<boolean> {
    console.log(`Recipe being removed by admin: ${user.email}`);
    return await this.recipesService.remove(id);
  }

  @Public()
  @Subscription(() => Recipe)
  recipeAdded() {
    return pubSub.asyncIterator('recipeAdded');
  }
}
