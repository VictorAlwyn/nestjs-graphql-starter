import {
  pgTable,
  varchar,
  timestamp,
  text,
  uuid,
  jsonb,
  integer,
} from 'drizzle-orm/pg-core';

import { betterAuthUsers } from './better-auth.schema';

export enum AuditLogAction {
  // Authentication actions
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  PASSWORD_RESET = 'password_reset',
  PASSWORD_CHANGE = 'password_change',

  // GraphQL operations
  GRAPHQL_QUERY = 'graphql_query',
  GRAPHQL_MUTATION = 'graphql_mutation',
  GRAPHQL_SUBSCRIPTION = 'graphql_subscription',

  // User management
  USER_CREATE = 'user_create',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  USER_ACTIVATE = 'user_activate',
  USER_DEACTIVATE = 'user_deactivate',
  USER_READ = 'user_read',

  // AI/Worker operations
  AI_GENERATE = 'ai_generate',
  AI_PROCESS = 'ai_process',
  WORKER_JOB = 'worker_job',

  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  RATE_LIMIT_RESET = 'rate_limit_reset',

  // System operations
  SYSTEM_ERROR = 'system_error',
  SYSTEM_WARNING = 'system_warning',
  SYSTEM_INFO = 'system_info',

  // Custom actions
  CUSTOM = 'custom',
}

export enum AuditLogStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),

  // User information
  userId: uuid('user_id').references(() => betterAuthUsers.id, {
    onDelete: 'set null',
  }),
  userEmail: varchar('user_email', { length: 255 }),
  userRole: varchar('user_role', { length: 50 }),

  // Action details
  action: varchar('action', { length: 100 }).notNull(),
  resource: varchar('resource', { length: 255 }),
  resourceId: varchar('resource_id', { length: 255 }),

  // Request context
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  requestId: varchar('request_id', { length: 255 }),

  // GraphQL specific
  operationName: varchar('operation_name', { length: 255 }),
  operationType: varchar('operation_type', { length: 50 }),
  variables: jsonb('variables'),

  // Performance and status
  duration: integer('duration'), // in milliseconds
  status: varchar('status', { length: 20 })
    .notNull()
    .default(AuditLogStatus.SUCCESS),
  errorMessage: text('error_message'),

  // Additional data
  metadata: jsonb('metadata'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
