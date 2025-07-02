import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { AuditLogAction } from '../../infra/database/schemas/audit-logs.schema';
import { extractGraphQLContext } from '../types/graphql.types';

import { RateLimitService } from './rate-limit.service';

export interface RateLimitOptions {
  action: AuditLogAction;
  resource?: string;
  maxRequests?: number;
  windowMs?: number;
}

export const RATE_LIMIT_KEY = 'rate_limit';

export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimitService: RateLimitService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) {
      return true; // No rate limit configured
    }

    const gqlContext = GqlExecutionContext.create(context);
    const ctx = extractGraphQLContext(gqlContext.getContext());
    const request = ctx.req;
    const user = request?.user;

    if (!user?.id) {
      // Allow unauthenticated requests (or you can throw an error)
      return true;
    }

    const result = await this.rateLimitService.checkRateLimit(
      user.id,
      options.action,
      options.resource,
      {
        maxRequests: options.maxRequests,
        windowMs: options.windowMs,
      },
    );

    if (!result.isAllowed) {
      throw new ForbiddenException({
        message: 'Rate limit exceeded',
        remaining: result.remaining,
        resetTime: result.resetTime,
        limit: result.limit,
      });
    }

    return true;
  }
}
