import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';

import { Audit } from '../../core/decorators/audit.decorator';
import { Public, Auth } from '../../core/decorators/auth.decorators';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { AuditLogAction } from '../../infra/database/schemas/audit-logs.schema';
import { UserModel } from '../user/models/user.model';

import { AuthService } from './auth.service';
import {
  LoginInput,
  RegisterInput,
  RequestPasswordResetInput,
  ResetPasswordInput,
} from './dto/auth.inputs';
import { AuthPayload } from './dto/auth.outputs';
import { AuthEmailService } from './services/auth-email.service';

interface GraphQLContext {
  req: unknown;
}

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly authEmailService: AuthEmailService,
  ) {}

  @Mutation(() => AuthPayload)
  @Public()
  @Audit({ action: AuditLogAction.LOGIN, resource: 'auth' })
  async login(
    @Args('input') loginInput: LoginInput,
    @Context() context: GraphQLContext,
  ): Promise<AuthPayload> {
    return this.authService.login(loginInput, context.req);
  }

  @Mutation(() => AuthPayload)
  @Public()
  @Audit({ action: AuditLogAction.REGISTER, resource: 'auth' })
  async register(
    @Args('input') registerInput: RegisterInput,
    @Context() context: GraphQLContext,
  ): Promise<AuthPayload> {
    return this.authService.register(registerInput, context.req);
  }

  @Mutation(() => AuthPayload)
  @Audit({ action: AuditLogAction.LOGIN, resource: 'oauth' })
  async loginWithOAuth(
    @Args('provider') provider: string,
    @Args('code') code: string,
    @Context() context: GraphQLContext,
  ): Promise<AuthPayload> {
    return this.authService.loginWithOAuth(provider, code, context.req);
  }

  @Mutation(() => Boolean)
  @Auth()
  @Audit({ action: AuditLogAction.LOGOUT, resource: 'auth' })
  async logout(@Context() context: GraphQLContext): Promise<boolean> {
    await this.authService.logout(context.req);
    return true;
  }

  @Mutation(() => Boolean)
  @Audit({ action: AuditLogAction.PASSWORD_RESET, resource: 'auth' })
  async requestPasswordReset(
    @Args('input') input: RequestPasswordResetInput,
    @Context() context: GraphQLContext,
  ): Promise<boolean> {
    await this.authService.requestPasswordReset(input.email, context.req);
    return true;
  }

  @Mutation(() => Boolean)
  @Audit({ action: AuditLogAction.PASSWORD_RESET, resource: 'auth' })
  async resetPassword(
    @Args('input') input: ResetPasswordInput,
    @Context() context: GraphQLContext,
  ): Promise<boolean> {
    await this.authService.resetPassword(
      input.token,
      input.newPassword,
      context.req,
    );
    return true;
  }

  @Query(() => UserModel, { nullable: true })
  @Auth()
  me(@CurrentUser() user: UserModel): UserModel {
    return user;
  }

  @Query(() => [String])
  getOAuthProviders(): string[] {
    return this.authService.getOAuthProviders();
  }

  @Query(() => String)
  getOAuthUrl(@Args('provider') provider: string): string {
    return this.authService.getOAuthUrl(provider);
  }

  @Query(() => Boolean)
  @Auth()
  async validateToken(@Args('token') token: string): Promise<boolean> {
    const user = await this.authService.validateUser(token);
    return !!user;
  }
}
