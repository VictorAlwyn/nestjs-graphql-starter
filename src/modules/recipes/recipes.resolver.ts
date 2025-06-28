import { NotFoundException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { NewRecipeInput } from './dto/new-recipe.input';
import { RecipesArgs } from './dto/recipes.args';
import { Recipe } from './models/recipe.model';
import { RecipesService } from './recipes.service';

@Resolver(() => Recipe)
export class RecipesResolver {
  private pubSub = new PubSub();

  constructor(private readonly recipesService: RecipesService) {}

  @Query(() => Recipe)
  public recipe(@Args('id') id: string): Recipe {
    const recipe = this.recipesService.findOneById(id);
    if (!recipe) {
      throw new NotFoundException(id);
    }
    return recipe;
  }

  @Query(() => [Recipe])
  public recipes(@Args() recipesArgs: RecipesArgs): Recipe[] {
    return this.recipesService.findAll(recipesArgs);
  }

  @Mutation(() => Recipe)
  public addRecipe(
    @Args('newRecipeData') newRecipeData: NewRecipeInput,
  ): Recipe {
    const recipe = this.recipesService.create(newRecipeData);
    this.pubSub.publish('recipeAdded', { recipeAdded: recipe });
    return recipe;
  }

  @Mutation(() => Boolean)
  public removeRecipe(@Args('id') id: string): boolean {
    return this.recipesService.remove(id);
  }

  @Subscription(() => Recipe)
  public recipeAdded() {
    return this.pubSub.asyncIterator('recipeAdded');
  }
}
