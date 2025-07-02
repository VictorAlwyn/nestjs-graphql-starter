import { randomBytes } from 'crypto';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import * as jwt from 'jsonwebtoken';

import { AuditService } from '../../core/audit/audit.service';
import { AuditLogAction } from '../../infra/database/schemas/audit-logs.schema';
import { BetterAuthUser } from '../../infra/database/schemas/better-auth.schema';
import { DatabaseService } from '../database/database.service';
import {
  type NewBetterAuthUser,
  type BetterAuthSession,
  type NewBetterAuthSession,
  betterAuthUsers,
} from '../database/schemas/better-auth.schema';

import { DrizzleBetterAuthAdapter } from './better-auth-adapter';
import { createBetterAuthConfig, BetterAuthConfig } from './better-auth.config';

export interface BetterAuthSessionResponse {
  user: BetterAuthUser;
  token: string;
  expiresAt: Date;
}

@Injectable()
export class BetterAuthService {
  private readonly logger = new Logger(BetterAuthService.name);
  private readonly config: BetterAuthConfig;
  private readonly adapter: DrizzleBetterAuthAdapter;

  constructor(
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
    private readonly databaseService: DatabaseService,
  ) {
    this.config = createBetterAuthConfig(configService);
    this.adapter = new DrizzleBetterAuthAdapter(databaseService);
    this.logger.log('Better Auth initialized successfully');
  }

  /**
   * Get session from request
   */
  async getSession(req: any): Promise<BetterAuthSessionResponse | null> {
    try {
      const token = this.extractTokenFromRequest(req);
      if (!token) return null;

      const session = await this.adapter.getSessionByToken(token);
      if (!session || new Date() > session.expiresAt) {
        return null;
      }

      const user = await this.adapter.getUserById(session.userId);
      if (!user || !user.isActive) {
        return null;
      }

      return {
        user,
        token: session.token,
        expiresAt: session.expiresAt,
      };
    } catch (error) {
      this.logger.error('Error getting session', error);
      return null;
    }
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<BetterAuthUser | null> {
    try {
      const decoded = jwt.verify(token, this.config.session.secret) as any;
      const user = await this.adapter.getUserById(decoded.userId);
      return user && user.isActive ? user : null;
    } catch (error) {
      this.logger.error('Error validating token', error);
      return null;
    }
  }

  /**
   * Login with email and password
   */
  async loginWithEmail(
    email: string,
    password: string,
    req: any,
  ): Promise<BetterAuthSessionResponse> {
    try {
      const user = await this.adapter.getUserByEmail(email);
      if (!user || !user.isActive) {
        throw new Error('Invalid credentials');
      }

      // Check if account is locked
      if (user.lockedUntil && new Date() < user.lockedUntil) {
        throw new Error('Account is temporarily locked');
      }

      // Verify password (assuming password is stored in a separate field)
      const isValidPassword = await this.verifyPassword(password, user);
      if (!isValidPassword) {
        await this.handleFailedLogin(user);
        throw new Error('Invalid credentials');
      }

      // Reset login attempts on successful login
      await this.adapter.updateUser(user.id, {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      });

      // Create session
      const session = await this.createSession(user.id, req);

      // Log audit event
      await this.auditService.logAuthEvent(
        AuditLogAction.LOGIN,
        this.mapToUser(user),
        {
          metadata: {
            provider: user.authProvider,
            ipAddress: req.ip,
            userAgent: req.headers?.['user-agent'],
          },
        },
      );

      return {
        user,
        token: session.token,
        expiresAt: session.expiresAt,
      };
    } catch (error) {
      this.logger.error('Email login failed', error);
      throw error;
    }
  }

  /**
   * Register with email and password
   */
  async registerWithEmail(
    email: string,
    password: string,
    name: string,
    req: any,
  ): Promise<BetterAuthSessionResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.adapter.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(
        password,
        this.config.security.bcryptRounds,
      );

      // Create user
      const userData: NewBetterAuthUser = {
        email,
        name,
        password: hashedPassword,
        role: 'user',
        isActive: true,
        authProvider: 'email',
        emailVerified: false,
        loginAttempts: 0,
      };

      const user = await this.adapter.createUser(userData);

      // Create session
      const session = await this.createSession(user.id, req);

      // Log audit event
      await this.auditService.logAuthEvent(
        AuditLogAction.REGISTER,
        this.mapToUser(user),
        {
          metadata: {
            provider: user.authProvider,
            ipAddress: req.ip,
            userAgent: req.headers?.['user-agent'],
          },
        },
      );

      return {
        user,
        token: session.token,
        expiresAt: session.expiresAt,
      };
    } catch (error) {
      this.logger.error('Email registration failed', error);
      throw error;
    }
  }

  /**
   * Login with OAuth provider
   */
  async loginWithOAuth(
    provider: string,
    code: string,
    req: any,
  ): Promise<BetterAuthSessionResponse> {
    try {
      // This is a simplified OAuth implementation
      // In production, you would exchange the code for tokens with the OAuth provider
      throw new Error(`${provider} OAuth login not implemented yet`);
    } catch (error) {
      this.logger.error(`${provider} OAuth login failed`, error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(req: any): Promise<void> {
    try {
      const token = this.extractTokenFromRequest(req);
      if (token) {
        const session = await this.adapter.getSessionByToken(token);
        if (session) {
          await this.adapter.deleteSession(session.id);
        }
      }
    } catch (error) {
      this.logger.error('Logout failed', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string, req: any): Promise<void> {
    try {
      const user = await this.adapter.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not
        return;
      }

      const resetToken = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await this.adapter.updateUser(user.id, {
        passwordResetToken: resetToken,
        passwordResetExpires: expiresAt,
      });

      // TODO: Send email with reset token
      this.logger.log(`Password reset requested for ${email}`);
    } catch (error) {
      this.logger.error('Password reset request failed', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    newPassword: string,
    req: any,
  ): Promise<void> {
    try {
      // Find user by reset token
      const users = await this.databaseService.drizzle
        .select()
        .from(betterAuthUsers)
        .where(eq(betterAuthUsers.passwordResetToken, token));

      const user = users[0];
      if (
        !user ||
        !user.passwordResetExpires ||
        new Date() > user.passwordResetExpires
      ) {
        throw new Error('Invalid or expired reset token');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(
        newPassword,
        this.config.security.bcryptRounds,
      );

      // Update user
      await this.adapter.updateUser(user.id, {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      });

      // Log audit event
      await this.auditService.logAuthEvent(
        AuditLogAction.PASSWORD_RESET,
        this.mapToUser(user),
        {
          metadata: {
            ipAddress: req.ip,
            userAgent: req.headers?.['user-agent'],
          },
        },
      );
    } catch (error) {
      this.logger.error('Password reset failed', error);
      throw error;
    }
  }

  /**
   * Get OAuth URL for provider
   */
  getOAuthUrl(provider: string): string {
    // This would return the OAuth authorization URL
    return `https://example.com/oauth/${provider}`;
  }

  /**
   * Get available OAuth providers
   */
  getOAuthProviders(): string[] {
    return ['google', 'facebook'];
  }

  /**
   * Create a new session for a user
   */
  private async createSession(
    userId: string,
    req: any,
  ): Promise<BetterAuthSession> {
    const token = jwt.sign(
      { userId, iat: Date.now() },
      this.config.session.secret,
    );

    const expiresAt = new Date(
      Date.now() + this.parseExpiresIn(this.config.session.expiresIn),
    );

    const sessionData: NewBetterAuthSession = {
      userId,
      token,
      expiresAt,
      ipAddress: req.ip,
      userAgent: req.headers?.['user-agent'],
      isActive: true,
    };

    return await this.adapter.createSession(sessionData);
  }

  /**
   * Extract token from request
   */
  private extractTokenFromRequest(req: any): string | null {
    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }

  /**
   * Verify password using bcrypt
   */
  private async verifyPassword(
    password: string,
    user: BetterAuthUser,
  ): Promise<boolean> {
    if (!user.password) {
      return false;
    }

    try {
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      this.logger.error('Password verification failed', error);
      return false;
    }
  }

  /**
   * Handle failed login attempts
   */
  private async handleFailedLogin(user: BetterAuthUser): Promise<void> {
    const newAttempts = (user.loginAttempts || 0) + 1;

    if (newAttempts >= this.config.security.maxLoginAttempts) {
      const lockedUntil = new Date(
        Date.now() + this.config.security.lockoutDuration,
      );
      await this.adapter.updateUser(user.id, {
        loginAttempts: newAttempts,
        lockedUntil,
      });
    } else {
      await this.adapter.updateUser(user.id, {
        loginAttempts: newAttempts,
      });
    }
  }

  /**
   * Parse expiresIn string to milliseconds
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // Default to 7 days

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }

  /**
   * Map Better Auth user to internal User type
   */
  private mapToUser(betterAuthUser: BetterAuthUser): BetterAuthUser {
    return betterAuthUser;
  }
}
