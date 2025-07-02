import { Injectable, Logger } from '@nestjs/common';
import { eq, and, gte, count } from 'drizzle-orm';

import { DatabaseService } from '../../infra/database/database.service';
import {
  auditLogs,
  AuditLogAction,
} from '../../infra/database/schemas/audit-logs.schema';
import { BetterAuthUser } from '../../infra/database/schemas/better-auth.schema';

import { AuditService } from './audit.service';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // in milliseconds
  action: AuditLogAction;
  resource?: string;
}

export interface RateLimitResult {
  isAllowed: boolean;
  remaining: number;
  resetTime: Date;
  limit: number;
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  // Default rate limit configurations
  private readonly defaultConfigs: Map<string, RateLimitConfig> = new Map([
    [
      'ai_generate',
      {
        maxRequests: 10,
        windowMs: 60 * 60 * 1000,
        action: AuditLogAction.AI_GENERATE,
      },
    ], // 10 per hour
    [
      'ai_process',
      {
        maxRequests: 50,
        windowMs: 60 * 60 * 1000,
        action: AuditLogAction.AI_PROCESS,
      },
    ], // 50 per hour
    [
      'graphql_query',
      {
        maxRequests: 1000,
        windowMs: 60 * 60 * 1000,
        action: AuditLogAction.GRAPHQL_QUERY,
      },
    ], // 1000 per hour
    [
      'graphql_mutation',
      {
        maxRequests: 100,
        windowMs: 60 * 60 * 1000,
        action: AuditLogAction.GRAPHQL_MUTATION,
      },
    ], // 100 per hour
    [
      'auth_login',
      {
        maxRequests: 5,
        windowMs: 15 * 60 * 1000,
        action: AuditLogAction.LOGIN,
      },
    ], // 5 per 15 minutes
  ]);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Check if a user is allowed to perform an action based on rate limits
   */
  async checkRateLimit(
    userId: string,
    action: AuditLogAction,
    resource?: string,
    customConfig?: Partial<RateLimitConfig>,
  ): Promise<RateLimitResult> {
    const config = this.getConfig(action, resource, customConfig);
    const windowStart = new Date(Date.now() - config.windowMs);

    try {
      // Count recent requests for this user and action
      const result = await this.databaseService.drizzle
        .select({ count: count() })
        .from(auditLogs)
        .where(
          and(
            eq(auditLogs.userId, userId),
            eq(auditLogs.action, action),
            resource ? eq(auditLogs.resource, resource) : undefined,
            gte(auditLogs.createdAt, windowStart),
          ),
        );

      const currentCount = result[0]?.count || 0;
      const isAllowed = currentCount < config.maxRequests;
      const remaining = Math.max(0, config.maxRequests - currentCount);
      const resetTime = new Date(Date.now() + config.windowMs);

      // Log rate limit check
      if (!isAllowed) {
        await this.auditService.logRateLimitEvent(
          AuditLogAction.RATE_LIMIT_EXCEEDED,
          resource || action,
          { id: userId } as BetterAuthUser,
          {
            metadata: {
              currentCount,
              limit: config.maxRequests,
              windowMs: config.windowMs,
            },
          },
        );
      }

      return {
        isAllowed,
        remaining,
        resetTime,
        limit: config.maxRequests,
      };
    } catch (error) {
      this.logger.error('Error checking rate limit', error);
      // On error, allow the request to avoid blocking users
      return {
        isAllowed: true,
        remaining: config.maxRequests,
        resetTime: new Date(Date.now() + config.windowMs),
        limit: config.maxRequests,
      };
    }
  }

  /**
   * Get rate limit configuration for an action
   */
  private getConfig(
    action: AuditLogAction,
    resource?: string,
    customConfig?: Partial<RateLimitConfig>,
  ): RateLimitConfig {
    const key = resource ? `${action}_${resource}` : action;
    const defaultConfig =
      this.defaultConfigs.get(key) || this.defaultConfigs.get(action);

    if (!defaultConfig) {
      // Default fallback configuration
      return {
        maxRequests: 100,
        windowMs: 60 * 60 * 1000, // 1 hour
        action,
        resource,
        ...customConfig,
      };
    }

    return {
      ...defaultConfig,
      ...customConfig,
    };
  }

  /**
   * Get user's current usage statistics
   */
  async getUserUsageStats(
    userId: string,
  ): Promise<
    Record<string, { current: number; limit: number; resetTime: Date }>
  > {
    const stats: Record<
      string,
      { current: number; limit: number; resetTime: Date }
    > = {};

    for (const [key, config] of this.defaultConfigs.entries()) {
      const windowStart = new Date(Date.now() - config.windowMs);

      try {
        const result = await this.databaseService.drizzle
          .select({ count: count() })
          .from(auditLogs)
          .where(
            and(
              eq(auditLogs.userId, userId),
              eq(auditLogs.action, config.action),
              config.resource
                ? eq(auditLogs.resource, config.resource)
                : undefined,
              gte(auditLogs.createdAt, windowStart),
            ),
          );

        const currentCount = result[0]?.count || 0;
        stats[key] = {
          current: currentCount,
          limit: config.maxRequests,
          resetTime: new Date(Date.now() + config.windowMs),
        };
      } catch (error) {
        this.logger.error(`Error getting usage stats for ${key}`, error);
        stats[key] = {
          current: 0,
          limit: config.maxRequests,
          resetTime: new Date(Date.now() + config.windowMs),
        };
      }
    }

    return stats;
  }

  /**
   * Reset rate limits for a user (admin function)
   */
  async resetUserRateLimits(
    userId: string,
    action?: AuditLogAction,
  ): Promise<void> {
    try {
      const whereConditions = [eq(auditLogs.userId, userId)];
      if (action) {
        whereConditions.push(eq(auditLogs.action, action));
      }

      // Note: In a real implementation, you might want to mark records as reset
      // rather than deleting them for audit purposes
      await this.auditService.logRateLimitEvent(
        AuditLogAction.RATE_LIMIT_RESET,
        action || 'all',
        { id: userId } as BetterAuthUser,
        {
          metadata: { resetBy: 'admin' },
        },
      );
    } catch (error) {
      this.logger.error('Error resetting rate limits', error);
      throw error;
    }
  }

  /**
   * Add custom rate limit configuration
   */
  addCustomConfig(key: string, config: RateLimitConfig): void {
    this.defaultConfigs.set(key, config);
  }

  /**
   * Get all rate limit configurations
   */
  getConfigurations(): Map<string, RateLimitConfig> {
    return new Map(this.defaultConfigs);
  }
}
