import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Auth, Public } from '../../core/decorators/auth.decorators';
import { CurrentUser } from '../../core/decorators/current-user.decorator';

import { UpdateUserInput, RegisterInput } from './dto/user.input';
import { UserResponse, DeleteUserResponse } from './dto/user.output';
import { UserModel } from './models/user.model';
import { UserService } from './user.service';

@Resolver(() => UserModel)
export class UserResolver {
  constructor(private readonly userService: UserService) { }

  @Public()
  @Mutation(() => UserModel)
  async register(@Args('input') input: RegisterInput): Promise<UserModel> {
    return this.userService.createUser(input);
  }

  @Auth()
  @Query(() => UserModel)
  me(@CurrentUser() user: UserModel): Promise<UserModel> {
    return this.userService.getUserById(user.id);
  }

  @Auth()
  @Query(() => UserModel)
  user(@Args('id', { type: () => ID }) id: string): Promise<UserModel> {
    return this.userService.getUserById(id);
  }

  @Auth()
  @Query(() => [UserModel])
  users(
    @Args('limit', { type: () => Number, nullable: true }) limit = 20,
    @Args('offset', { type: () => Number, nullable: true }) offset = 0,
  ): Promise<UserModel[]> {
    return this.userService.getUsers(limit, offset);
  }

  @Auth()
  @Mutation(() => UserResponse)
  async updateUser(
    @CurrentUser() user: UserModel,
    @Args('input') input: UpdateUserInput,
  ): Promise<UserResponse> {
    const updated = await this.userService.updateUser(user.id, input);
    return { user: updated, message: 'User updated successfully' };
  }

  @Auth()
  @Mutation(() => DeleteUserResponse)
  async deleteUser(
    @CurrentUser() user: UserModel,
  ): Promise<DeleteUserResponse> {
    await this.userService.deleteUser(user.id);
    return { success: true, message: 'User deleted successfully' };
  }
}
