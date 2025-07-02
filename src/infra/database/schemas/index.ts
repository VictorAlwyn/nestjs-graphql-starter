// Export all database schemas here
// export * from './users.schema';
export * from './audit-logs.schema';
export * from './better-auth.schema';

// Re-export UserRole from better-auth for backward compatibility
export { UserRole } from './better-auth.schema';

// Import schemas for database initialization
import { auditLogs } from './audit-logs.schema';
import {
  betterAuthUsers,
  betterAuthSessions,
  betterAuthOAuthAccounts,
  betterAuthAuditLogs,
} from './better-auth.schema';
// import { users } from './users.schema';

// Export all schemas for database initialization
export const schemas = {
  auditLogs,
  // users,
  betterAuthUsers,
  betterAuthSessions,
  betterAuthOAuthAccounts,
  betterAuthAuditLogs,
};
