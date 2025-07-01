import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Auth, Public } from '../../core/decorators/auth.decorators';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { UserModel } from '../user/models/user.model';

import { LoginInput } from './dto/auth.inputs';
import { AuthPayload, MessageResponse } from './dto/auth.outputs';
import { AuthService } from './services/auth.service';

@Resolver(() => UserModel)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => AuthPayload)
  async login(
    @Args('loginInput') loginInput: LoginInput,
  ): Promise<AuthPayload> {
    return this.authService.login(loginInput);
  }

  @Auth()
  @Query(() => UserModel)
  me(@CurrentUser() user: UserModel): UserModel {
    return user;
  }

  @Auth()
  @Mutation(() => MessageResponse)
  logout(): MessageResponse {
    return { message: 'Logged out successfully' };
  }
}
