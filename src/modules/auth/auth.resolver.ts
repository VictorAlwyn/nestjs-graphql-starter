import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Auth, Public } from '../../core/decorators/auth.decorators';
import { CurrentUser } from '../../core/decorators/current-user.decorator';

import { LoginInput, RegisterInput } from './dto/auth.inputs';
import { AuthPayload, MessageResponse } from './dto/auth.outputs';
import { User } from './models/user.model';
import { AuthService } from './services/auth.service';

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => AuthPayload)
  async register(
    @Args('registerInput') registerInput: RegisterInput,
  ): Promise<AuthPayload> {
    return this.authService.register(registerInput);
  }

  @Public()
  @Mutation(() => AuthPayload)
  async login(
    @Args('loginInput') loginInput: LoginInput,
  ): Promise<AuthPayload> {
    return this.authService.login(loginInput);
  }

  @Auth()
  @Query(() => User)
  me(@CurrentUser() user: User): User {
    return user;
  }

  @Auth()
  @Mutation(() => MessageResponse)
  logout(): MessageResponse {
    return { message: 'Logged out successfully' };
  }
}
