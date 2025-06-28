import { NotFoundException } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { PubSub } from 'mercurius';
import { NewRecipeInput } from './dto/new-recipe.input';
import { RecipesArgs } from './dto/recipes.args';
import { Recipe } from './models/recipe.model';
import { RecipesService } from './recipes.service';

@Resolver(() => Recipe)
export class RecipesResolver {
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
    @Context('pubsub') pubSub: PubSub,
  ): Recipe {
    const recipe = this.recipesService.create(newRecipeData);
    pubSub.publish({ topic: 'recipeAdded', payload: { recipeAdded: recipe } });
    return recipe;
  }

  @Mutation(() => Boolean)
  public removeRecipe(@Args('id') id: string): boolean {
    return this.recipesService.remove(id);
  }

  @Subscription(() => Recipe)
  public recipeAdded(
    @Context('pubsub') pubSub: PubSub,
  ): Promise<AsyncIterableIterator<Recipe>> {
    return pubSub.subscribe('recipeAdded');
  }
}
