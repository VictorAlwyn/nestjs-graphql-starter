import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import {
  AuditLogAction,
  AuditLogStatus,
} from '../../infra/database/schemas/audit-logs.schema';
import { BetterAuthUser } from '../../infra/database/schemas/better-auth.schema';

import { AuditService } from './audit.service';

interface GraphQLContext {
  req?: {
    user?: BetterAuthUser;
    ip?: string;
    connection?: {
      remoteAddress?: string;
    };
    headers?: Record<string, string>;
    body?: {
      variables?: Record<string, unknown>;
    };
  };
}

interface GraphQLInfo {
  operation?: {
    name?: {
      value?: string;
    };
    operation?: string;
  };
}

@Injectable()
export class AuditGraphQLInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    const ctx = gqlContext.getContext();

    // Extract operation details safely
    const operationName = this.getOperationName(info);
    const operationType = this.getOperationType(info);
    const variables = this.getVariables(ctx);

    // Extract user information
    const user = ctx.req?.user;

    // Extract request context
    const ipAddress = this.getIpAddress(ctx);
    const userAgent = ctx.req?.headers?.['user-agent'];
    const requestId =
      ctx.req?.headers?.['x-request-id'] ?? this.generateRequestId();

    // Determine the appropriate audit action
    const auditAction = this.getAuditAction(operationType);

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        // Log successful operation
        if (
          auditAction === AuditLogAction.GRAPHQL_QUERY ||
          auditAction === AuditLogAction.GRAPHQL_MUTATION ||
          auditAction === AuditLogAction.GRAPHQL_SUBSCRIPTION
        ) {
          void this.auditService.logGraphQLOperation(
            auditAction,
            operationName,
            operationType,
            variables,
            user,
            {
              ipAddress,
              userAgent,
              requestId,
            },
          );
        } else {
          // Use createAuditLog for custom actions
          void this.auditService.createAuditLog({
            action: auditAction,
            resource: 'graphql',
            context: {
              operationName,
              operationType,
              variables,
              userId: user?.id,
              userEmail: user?.email,
              userRole: user?.role,
              ipAddress,
              userAgent,
              requestId,
            },
          });
        }
      }),
      catchError((error: Error) => {
        const duration = Date.now() - startTime;

        // Log failed operation
        void this.auditService.createAuditLog({
          action: auditAction,
          resource: 'graphql',
          status: AuditLogStatus.FAILURE,
          duration,
          errorMessage: error.message,
          context: {
            operationName,
            operationType,
            variables,
            userId: user?.id,
            userEmail: user?.email,
            userRole: user?.role,
            ipAddress,
            userAgent,
            requestId,
          },
        });

        throw error;
      }),
    );
  }

  private getOperationName(info: GraphQLInfo): string {
    return info?.operation?.name?.value ?? 'Anonymous';
  }

  private getOperationType(info: GraphQLInfo): string {
    return info?.operation?.operation ?? 'unknown';
  }

  private getVariables(ctx: GraphQLContext): Record<string, unknown> {
    return ctx?.req?.body?.variables ?? {};
  }

  private getIpAddress(ctx: GraphQLContext): string | undefined {
    return ctx?.req?.ip ?? ctx?.req?.connection?.remoteAddress;
  }

  private getAuditAction(operationType: string): AuditLogAction {
    switch (operationType) {
      case 'query':
        return AuditLogAction.GRAPHQL_QUERY;
      case 'mutation':
        return AuditLogAction.GRAPHQL_MUTATION;
      case 'subscription':
        return AuditLogAction.GRAPHQL_SUBSCRIPTION;
      default:
        return AuditLogAction.CUSTOM;
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
