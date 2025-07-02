import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { extractGraphQLContext } from '../../../core/types/graphql.types';
import { UserRole } from '../../database/schemas/better-auth.schema';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const gqlContext = extractGraphQLContext(ctx.getContext());
    const user = gqlContext?.req?.user;

    if (!user) {
      return false;
    }

    return requiredRoles.includes(user.role as UserRole);
  }
}
