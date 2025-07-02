import { Injectable, Logger } from '@nestjs/common';

import { DatabaseService } from '../../infra/database/database.service';
import {
  auditLogs,
  AuditLogAction,
  AuditLogStatus,
  type NewAuditLog,
} from '../../infra/database/schemas/audit-logs.schema';
import { BetterAuthUser } from '../../infra/database/schemas/better-auth.schema';

export interface AuditLogContext {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  operationName?: string;
  operationType?: string;
  variables?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface CreateAuditLogParams {
  action: AuditLogAction;
  resource?: string;
  resourceId?: string;
  status?: AuditLogStatus;
  duration?: number;
  errorMessage?: string;
  context?: AuditLogContext;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Create an audit log entry
   */
  async createAuditLog(params: CreateAuditLogParams): Promise<void> {
    try {
      const auditLogData: NewAuditLog = {
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        status: params.status || AuditLogStatus.SUCCESS,
        duration: params.duration,
        errorMessage: params.errorMessage,
        metadata: params.context?.metadata,

        // User information
        userId: params.context?.userId,
        userEmail: params.context?.userEmail,
        userRole: params.context?.userRole,

        // Request context
        ipAddress: params.context?.ipAddress,
        userAgent: params.context?.userAgent,
        requestId: params.context?.requestId,

        // GraphQL specific
        operationName: params.context?.operationName,
        operationType: params.context?.operationType,
        variables: params.context?.variables,
      };

      await this.databaseService.drizzle.insert(auditLogs).values(auditLogData);

      this.logger.debug(`Audit log created: ${params.action}`, {
        action: params.action,
        resource: params.resource,
        userId: params.context?.userId,
      });
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Log authentication events
   */
  async logAuthEvent(
    action:
      | AuditLogAction.LOGIN
      | AuditLogAction.LOGOUT
      | AuditLogAction.REGISTER
      | AuditLogAction.PASSWORD_RESET
      | AuditLogAction.PASSWORD_CHANGE,
    user: BetterAuthUser | null,
    context?: Omit<AuditLogContext, 'userId' | 'userEmail' | 'userRole'>,
  ): Promise<void> {
    // Now that we use better_auth_users table, we can safely set userId
    await this.createAuditLog({
      action,
      resource: 'auth',
      context: {
        ...context,
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
      },
    });
  }

  /**
   * Log GraphQL operations
   */
  async logGraphQLOperation(
    action:
      | AuditLogAction.GRAPHQL_QUERY
      | AuditLogAction.GRAPHQL_MUTATION
      | AuditLogAction.GRAPHQL_SUBSCRIPTION,
    operationName: string,
    operationType: string,
    variables?: Record<string, unknown>,
    user?: BetterAuthUser | null,
    context?: Omit<
      AuditLogContext,
      | 'operationName'
      | 'operationType'
      | 'variables'
      | 'userId'
      | 'userEmail'
      | 'userRole'
    >,
  ): Promise<void> {
    await this.createAuditLog({
      action,
      resource: 'graphql',
      context: {
        ...context,
        operationName,
        operationType,
        variables,
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
      },
    });
  }

  /**
   * Log AI/Worker operations
   */
  async logAIOperation(
    action:
      | AuditLogAction.AI_GENERATE
      | AuditLogAction.AI_PROCESS
      | AuditLogAction.WORKER_JOB,
    resource: string,
    user?: BetterAuthUser | null,
    context?: Omit<AuditLogContext, 'userId' | 'userEmail' | 'userRole'>,
  ): Promise<void> {
    await this.createAuditLog({
      action,
      resource,
      context: {
        ...context,
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
      },
    });
  }

  /**
   * Log user management operations
   */
  async logUserOperation(
    action:
      | AuditLogAction.USER_CREATE
      | AuditLogAction.USER_UPDATE
      | AuditLogAction.USER_DELETE
      | AuditLogAction.USER_ACTIVATE
      | AuditLogAction.USER_DEACTIVATE,
    resourceId: string,
    user?: BetterAuthUser | null,
    context?: Omit<AuditLogContext, 'userId' | 'userEmail' | 'userRole'>,
  ): Promise<void> {
    await this.createAuditLog({
      action,
      resource: 'user',
      resourceId,
      context: {
        ...context,
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
      },
    });
  }

  /**
   * Log system events
   */
  async logSystemEvent(
    action:
      | AuditLogAction.SYSTEM_ERROR
      | AuditLogAction.SYSTEM_WARNING
      | AuditLogAction.SYSTEM_INFO,
    resource: string,
    errorMessage?: string,
    context?: AuditLogContext,
  ): Promise<void> {
    await this.createAuditLog({
      action,
      resource,
      status:
        action === AuditLogAction.SYSTEM_ERROR
          ? AuditLogStatus.FAILURE
          : AuditLogStatus.SUCCESS,
      errorMessage,
      context,
    });
  }

  /**
   * Log rate limiting events
   */
  async logRateLimitEvent(
    action:
      | AuditLogAction.RATE_LIMIT_EXCEEDED
      | AuditLogAction.RATE_LIMIT_RESET,
    resource: string,
    user?: BetterAuthUser | null,
    context?: Omit<AuditLogContext, 'userId' | 'userEmail' | 'userRole'>,
  ): Promise<void> {
    await this.createAuditLog({
      action,
      resource,
      status:
        action === AuditLogAction.RATE_LIMIT_EXCEEDED
          ? AuditLogStatus.FAILURE
          : AuditLogStatus.SUCCESS,
      context: {
        ...context,
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
      },
    });
  }

  /**
   * Log custom events
   */
  async logCustomEvent(
    resource: string,
    resourceId?: string,
    metadata?: Record<string, unknown>,
    user?: BetterAuthUser | null,
    context?: Omit<AuditLogContext, 'userId' | 'userEmail' | 'userRole'>,
  ): Promise<void> {
    await this.createAuditLog({
      action: AuditLogAction.CUSTOM,
      resource,
      resourceId,
      context: {
        ...context,
        metadata,
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
      },
    });
  }
}
