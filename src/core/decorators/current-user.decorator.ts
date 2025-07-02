import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { BetterAuthUser } from '../../infra/database/schemas/better-auth.schema';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): BetterAuthUser | undefined => {
    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext();
    if (
      ctx &&
      typeof ctx === 'object' &&
      'req' in ctx &&
      ctx.req &&
      typeof ctx.req === 'object' &&
      'user' in ctx.req
    ) {
      return ctx.req.user as BetterAuthUser | undefined;
    }
    return undefined;
  },
);
