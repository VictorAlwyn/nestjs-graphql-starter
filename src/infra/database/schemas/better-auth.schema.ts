import {
  pgTable,
  varchar,
  timestamp,
  text,
  uuid,
  jsonb,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

// Better Auth Users table
export const betterAuthUsers = pgTable('better_auth_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  password: text('password'),
  role: varchar('role', { length: 50 }).notNull().default(UserRole.USER),
  isActive: boolean('is_active').default(true).notNull(),
  authProvider: varchar('auth_provider', { length: 50 })
    .notNull()
    .default('email'),
  providerId: varchar('provider_id', { length: 255 }),
  avatarUrl: text('avatar_url'),
  emailVerified: boolean('email_verified').default(false).notNull(),
  emailVerificationToken: varchar('email_verification_token', { length: 255 }),
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetExpires: timestamp('password_reset_expires'),
  lastLoginAt: timestamp('last_login_at'),
  loginAttempts: integer('login_attempts').default(0),
  lockedUntil: timestamp('locked_until'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Better Auth Sessions table
export const betterAuthSessions = pgTable('better_auth_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => betterAuthUsers.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Better Auth OAuth Accounts table
export const betterAuthOAuthAccounts = pgTable('better_auth_oauth_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => betterAuthUsers.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 50 }).notNull(),
  providerId: varchar('provider_id', { length: 255 }).notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),
  scope: varchar('scope', { length: 500 }),
  tokenType: varchar('token_type', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Better Auth Audit Logs table (for auth-specific events)
export const betterAuthAuditLogs = pgTable('better_auth_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => betterAuthUsers.id),
  action: varchar('action', { length: 100 }).notNull(),
  resource: varchar('resource', { length: 255 }),
  resourceId: varchar('resource_id', { length: 255 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Types
export type BetterAuthUser = typeof betterAuthUsers.$inferSelect;
export type NewBetterAuthUser = typeof betterAuthUsers.$inferInsert;
export type BetterAuthSession = typeof betterAuthSessions.$inferSelect;
export type NewBetterAuthSession = typeof betterAuthSessions.$inferInsert;
export type BetterAuthOAuthAccount =
  typeof betterAuthOAuthAccounts.$inferSelect;
export type NewBetterAuthOAuthAccount =
  typeof betterAuthOAuthAccounts.$inferInsert;
export type BetterAuthAuditLog = typeof betterAuthAuditLogs.$inferSelect;
export type NewBetterAuthAuditLog = typeof betterAuthAuditLogs.$inferInsert;
