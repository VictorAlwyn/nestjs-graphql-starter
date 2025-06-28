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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public create(_data: NewRecipeInput): Recipe {
    return {} as Recipe;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public findOneById(_id: string): Recipe {
    return {} as Recipe;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public findAll(_recipesArgs: RecipesArgs): Recipe[] {
    return [] as Recipe[];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public remove(_id: string): boolean {
    return true;
  }
}
