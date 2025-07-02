import { Injectable, UnauthorizedException } from '@nestjs/common';

import { BetterAuthService } from '../../infra/better-auth/better-auth.service';
import {
  BetterAuthUser,
  UserRole,
} from '../../infra/database/schemas/better-auth.schema';
import { UserModel } from '../user/models/user.model';

import { LoginInput } from './dto/auth.inputs';
import { AuthPayload } from './dto/auth.outputs';

@Injectable()
export class AuthService {
  constructor(private readonly betterAuthService: BetterAuthService) {}

  async login(loginInput: LoginInput, req: any): Promise<AuthPayload> {
    try {
      const session = await this.betterAuthService.loginWithEmail(
        loginInput.email,
        loginInput.password,
        req,
      );

      return {
        token: session.token,
        user: this.mapToUserModel(session.user),
      };
    } catch (_error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async register(
    registerInput: { email: string; password: string; name: string },
    req: any,
  ): Promise<AuthPayload> {
    try {
      const session = await this.betterAuthService.registerWithEmail(
        registerInput.email,
        registerInput.password,
        registerInput.name,
        req,
      );

      return {
        token: session.token,
        user: this.mapToUserModel(session.user),
      };
    } catch (_error) {
      throw new UnauthorizedException('Registration failed');
    }
  }

  async loginWithOAuth(
    provider: string,
    code: string,
    req: any,
  ): Promise<AuthPayload> {
    try {
      const session = await this.betterAuthService.loginWithOAuth(
        provider,
        code,
        req,
      );

      return {
        token: session.token,
        user: this.mapToUserModel(session.user),
      };
    } catch (_error) {
      throw new UnauthorizedException(`${provider} OAuth login failed`);
    }
  }

  async logout(req: any): Promise<void> {
    await this.betterAuthService.logout(req);
  }

  async requestPasswordReset(email: string, req: any): Promise<void> {
    await this.betterAuthService.requestPasswordReset(email, req);
  }

  async resetPassword(
    token: string,
    newPassword: string,
    req: any,
  ): Promise<void> {
    await this.betterAuthService.resetPassword(token, newPassword, req);
  }

  async validateUser(token: string): Promise<UserModel | null> {
    const user = await this.betterAuthService.validateToken(token);
    return user ? this.mapToUserModel(user) : null;
  }

  getOAuthUrl(provider: string): string {
    return this.betterAuthService.getOAuthUrl(provider);
  }

  getOAuthProviders(): string[] {
    return this.betterAuthService.getOAuthProviders();
  }

  private mapToUserModel(betterAuthUser: BetterAuthUser): UserModel {
    return {
      id: betterAuthUser.id,
      email: betterAuthUser.email,
      name: betterAuthUser.name,
      role: betterAuthUser.role as UserRole, // Cast to UserRole
      isActive: betterAuthUser.isActive,
      createdAt: betterAuthUser.createdAt,
      updatedAt: betterAuthUser.updatedAt,
    };
  }
}
