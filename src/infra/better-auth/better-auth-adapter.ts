import { eq, and, lt } from 'drizzle-orm';

import { DatabaseService } from '../database/database.service';
import {
  betterAuthUsers,
  betterAuthSessions,
  betterAuthOAuthAccounts,
  betterAuthAuditLogs,
  type BetterAuthUser,
  type NewBetterAuthUser,
  type BetterAuthSession,
  type NewBetterAuthSession,
  type BetterAuthOAuthAccount,
  type NewBetterAuthOAuthAccount,
  type BetterAuthAuditLog,
  type NewBetterAuthAuditLog,
} from '../database/schemas/better-auth.schema';

export interface BetterAuthAdapter {
  // User operations
  createUser(userData: NewBetterAuthUser): Promise<BetterAuthUser>;
  getUserById(id: string): Promise<BetterAuthUser | null>;
  getUserByEmail(email: string): Promise<BetterAuthUser | null>;
  updateUser(
    id: string,
    userData: Partial<NewBetterAuthUser>,
  ): Promise<BetterAuthUser>;
  deleteUser(id: string): Promise<boolean>;

  // Session operations
  createSession(sessionData: NewBetterAuthSession): Promise<BetterAuthSession>;
  getSessionByToken(token: string): Promise<BetterAuthSession | null>;
  getSessionsByUserId(userId: string): Promise<BetterAuthSession[]>;
  updateSession(
    id: string,
    sessionData: Partial<NewBetterAuthSession>,
  ): Promise<BetterAuthSession>;
  deleteSession(id: string): Promise<boolean>;
  deleteExpiredSessions(): Promise<number>;

  // OAuth operations
  createOAuthAccount(
    accountData: NewBetterAuthOAuthAccount,
  ): Promise<BetterAuthOAuthAccount>;
  getOAuthAccount(
    provider: string,
    providerId: string,
  ): Promise<BetterAuthOAuthAccount | null>;
  getOAuthAccountsByUserId(userId: string): Promise<BetterAuthOAuthAccount[]>;
  updateOAuthAccount(
    id: string,
    accountData: Partial<NewBetterAuthOAuthAccount>,
  ): Promise<BetterAuthOAuthAccount>;
  deleteOAuthAccount(id: string): Promise<boolean>;

  // Audit operations
  createAuditLog(auditData: NewBetterAuthAuditLog): Promise<BetterAuthAuditLog>;
  getAuditLogsByUserId(
    userId: string,
    limit?: number,
  ): Promise<BetterAuthAuditLog[]>;
}

export class DrizzleBetterAuthAdapter implements BetterAuthAdapter {
  constructor(private readonly databaseService: DatabaseService) {}

  // User operations
  async createUser(userData: NewBetterAuthUser): Promise<BetterAuthUser> {
    const [user] = await this.databaseService.drizzle
      .insert(betterAuthUsers)
      .values(userData)
      .returning();
    return user;
  }

  async getUserById(id: string): Promise<BetterAuthUser | null> {
    const [user] = await this.databaseService.drizzle
      .select()
      .from(betterAuthUsers)
      .where(eq(betterAuthUsers.id, id));
    return user || null;
  }

  async getUserByEmail(email: string): Promise<BetterAuthUser | null> {
    const [user] = await this.databaseService.drizzle
      .select()
      .from(betterAuthUsers)
      .where(eq(betterAuthUsers.email, email));
    return user || null;
  }

  async updateUser(
    id: string,
    userData: Partial<NewBetterAuthUser>,
  ): Promise<BetterAuthUser> {
    const [user] = await this.databaseService.drizzle
      .update(betterAuthUsers)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(betterAuthUsers.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.databaseService.drizzle
      .delete(betterAuthUsers)
      .where(eq(betterAuthUsers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Session operations
  async createSession(
    sessionData: NewBetterAuthSession,
  ): Promise<BetterAuthSession> {
    const [session] = await this.databaseService.drizzle
      .insert(betterAuthSessions)
      .values(sessionData)
      .returning();
    return session;
  }

  async getSessionByToken(token: string): Promise<BetterAuthSession | null> {
    const [session] = await this.databaseService.drizzle
      .select()
      .from(betterAuthSessions)
      .where(
        and(
          eq(betterAuthSessions.token, token),
          eq(betterAuthSessions.isActive, true),
        ),
      );
    return session || null;
  }

  async getSessionsByUserId(userId: string): Promise<BetterAuthSession[]> {
    return await this.databaseService.drizzle
      .select()
      .from(betterAuthSessions)
      .where(
        and(
          eq(betterAuthSessions.userId, userId),
          eq(betterAuthSessions.isActive, true),
        ),
      );
  }

  async updateSession(
    id: string,
    sessionData: Partial<NewBetterAuthSession>,
  ): Promise<BetterAuthSession> {
    const [session] = await this.databaseService.drizzle
      .update(betterAuthSessions)
      .set({ ...sessionData, updatedAt: new Date() })
      .where(eq(betterAuthSessions.id, id))
      .returning();
    return session;
  }

  async deleteSession(id: string): Promise<boolean> {
    const result = await this.databaseService.drizzle
      .delete(betterAuthSessions)
      .where(eq(betterAuthSessions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async deleteExpiredSessions(): Promise<number> {
    const result = await this.databaseService.drizzle
      .delete(betterAuthSessions)
      .where(lt(betterAuthSessions.expiresAt, new Date()));
    return result.rowCount ?? 0;
  }

  // OAuth operations
  async createOAuthAccount(
    accountData: NewBetterAuthOAuthAccount,
  ): Promise<BetterAuthOAuthAccount> {
    const [account] = await this.databaseService.drizzle
      .insert(betterAuthOAuthAccounts)
      .values(accountData)
      .returning();
    return account;
  }

  async getOAuthAccount(
    provider: string,
    providerId: string,
  ): Promise<BetterAuthOAuthAccount | null> {
    const [account] = await this.databaseService.drizzle
      .select()
      .from(betterAuthOAuthAccounts)
      .where(
        and(
          eq(betterAuthOAuthAccounts.provider, provider),
          eq(betterAuthOAuthAccounts.providerId, providerId),
        ),
      );
    return account || null;
  }

  async getOAuthAccountsByUserId(
    userId: string,
  ): Promise<BetterAuthOAuthAccount[]> {
    return await this.databaseService.drizzle
      .select()
      .from(betterAuthOAuthAccounts)
      .where(eq(betterAuthOAuthAccounts.userId, userId));
  }

  async updateOAuthAccount(
    id: string,
    accountData: Partial<NewBetterAuthOAuthAccount>,
  ): Promise<BetterAuthOAuthAccount> {
    const [account] = await this.databaseService.drizzle
      .update(betterAuthOAuthAccounts)
      .set({ ...accountData, updatedAt: new Date() })
      .where(eq(betterAuthOAuthAccounts.id, id))
      .returning();
    return account;
  }

  async deleteOAuthAccount(id: string): Promise<boolean> {
    const result = await this.databaseService.drizzle
      .delete(betterAuthOAuthAccounts)
      .where(eq(betterAuthOAuthAccounts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Audit operations
  async createAuditLog(
    auditData: NewBetterAuthAuditLog,
  ): Promise<BetterAuthAuditLog> {
    const [audit] = await this.databaseService.drizzle
      .insert(betterAuthAuditLogs)
      .values(auditData)
      .returning();
    return audit;
  }

  async getAuditLogsByUserId(
    userId: string,
    limit = 100,
  ): Promise<BetterAuthAuditLog[]> {
    return await this.databaseService.drizzle
      .select()
      .from(betterAuthAuditLogs)
      .where(eq(betterAuthAuditLogs.userId, userId))
      .limit(limit)
      .orderBy(betterAuthAuditLogs.createdAt);
  }
}
