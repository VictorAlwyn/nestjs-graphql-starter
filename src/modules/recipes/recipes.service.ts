import { Injectable } from '@nestjs/common';

import { NewRecipeInput } from './dto/new-recipe.input';
import { RecipesArgs } from './dto/recipes.args';
import { Recipe } from './models/recipe.model';

@Injectable()
export class RecipesService {
  /**
   * MOCK
   * Put some real business logic here
   * Left for demonstration purposes
   */

  // eslint-disable-next-line @typescript-eslint/require-await
  public async create(_data: NewRecipeInput): Promise<Recipe> {
    return {} as Recipe;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async findOneById(_id: string): Promise<Recipe> {
    return {} as Recipe;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async findAll(_recipesArgs: RecipesArgs): Promise<Recipe[]> {
    return [] as Recipe[];
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async remove(_id: string): Promise<boolean> {
    return true;
  }
}
