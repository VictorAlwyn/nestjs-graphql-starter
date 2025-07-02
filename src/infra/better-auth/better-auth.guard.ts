import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { BetterAuthService } from './better-auth.service';

@Injectable()
export class BetterAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly betterAuthService: BetterAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;

    if (!request) {
      throw new UnauthorizedException('Request context not found');
    }

    try {
      const session = await this.betterAuthService.getSession(request);

      if (!session) {
        throw new UnauthorizedException('No valid session found');
      }

      // Attach user to request context for GraphQL
      request.user = session.user;
      request.session = session;

      return true;
    } catch (_error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
