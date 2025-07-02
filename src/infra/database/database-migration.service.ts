import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

import { DRIZZLE, DATABASE_POOL } from './constants';
import * as schema from './schemas';

export interface MigrationInfo {
  id: string;
  name: string;
  executedAt: Date;
  success: boolean;
  error?: string;
}

export interface MigrationStatus {
  pending: string[];
  applied: MigrationInfo[];
  lastMigration?: MigrationInfo;
  needsMigration: boolean;
}

@Injectable()
export class DatabaseMigrationService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseMigrationService.name);
  private readonly migrationsPath = path.join(process.cwd(), 'src/infra/database/migrations');

  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const autoMigrate = this.configService.get<boolean>('database.autoMigrate', false);
    
    if (autoMigrate && process.env.NODE_ENV !== 'production') {
      this.logger.log('Auto-migration enabled, running pending migrations...');
      await this.runMigrations();
    } else {
      this.logger.log('Auto-migration disabled, checking migration status...');
      const status = await this.getMigrationStatus();
      if (status.needsMigration) {
        this.logger.warn(
          `⚠️  Database has ${status.pending.length} pending migrations. Run migrations manually.`
        );
      } else {
        this.logger.log('✅ Database is up to date');
      }
    }
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<void> {
    try {
      this.logger.log('Starting database migrations...');
      
      // Ensure migrations directory exists
      if (!fs.existsSync(this.migrationsPath)) {
        this.logger.warn(`Migrations directory not found: ${this.migrationsPath}`);
        return;
      }

      // Run migrations using Drizzle's migrate function
      await migrate(this.db, { migrationsFolder: this.migrationsPath });
      
      this.logger.log('✅ Database migrations completed successfully');
    } catch (error) {
      this.logger.error('❌ Database migration failed:', error);
      throw error;
    }
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<MigrationStatus> {
    try {
      // Ensure migrations table exists
      await this.ensureMigrationsTable();

      // Get applied migrations from database
      const appliedMigrations = await this.getAppliedMigrations();
      
      // Get available migration files
      const availableMigrations = this.getAvailableMigrations();
      
      // Determine pending migrations
      const appliedIds = new Set(appliedMigrations.map(m => m.id));
      const pending = availableMigrations.filter(id => !appliedIds.has(id));

      return {
        pending,
        applied: appliedMigrations,
        lastMigration: appliedMigrations[appliedMigrations.length - 1],
        needsMigration: pending.length > 0,
      };
    } catch (error) {
      this.logger.error('Failed to get migration status:', error);
      throw error;
    }
  }

  /**
   * Rollback last migration (if supported)
   */
  async rollbackLastMigration(): Promise<void> {
    this.logger.warn('Migration rollback is not directly supported by Drizzle ORM');
    this.logger.warn('Please create a new migration to revert changes');
    throw new Error('Migration rollback not supported');
  }

  /**
   * Create a new migration file
   */
  async createMigration(name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
    const filename = `${timestamp}_${name.replace(/\s+/g, '_').toLowerCase()}.sql`;
    const filepath = path.join(this.migrationsPath, filename);

    // Ensure migrations directory exists
    if (!fs.existsSync(this.migrationsPath)) {
      fs.mkdirSync(this.migrationsPath, { recursive: true });
    }

    // Create empty migration file
    const template = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}

-- Add your migration SQL here
-- Example:
-- CREATE TABLE example (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP DEFAULT NOW()
-- );

-- Don't forget to add a rollback section if needed
-- Example rollback:
-- DROP TABLE IF EXISTS example;
`;

    fs.writeFileSync(filepath, template);
    this.logger.log(`Created migration file: ${filename}`);
    
    return filepath;
  }

  /**
   * Validate database schema against current models
   */
  async validateSchema(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Check if all required tables exist
      const tables = await this.getTableList();
      const requiredTables = [
        'better_auth_users',
        'better_auth_sessions',
        'better_auth_oauth_accounts',
        'better_auth_audit_logs',
        'audit_logs',
      ];

      for (const table of requiredTables) {
        if (!tables.includes(table)) {
          issues.push(`Missing table: ${table}`);
        }
      }

      // Additional schema validation can be added here
      // For example, checking column types, constraints, indexes, etc.

    } catch (error) {
      issues.push(`Schema validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Get database schema information
   */
  async getSchemaInfo() {
    try {
      const tables = await this.getTableList();
      const indexes = await this.getIndexList();
      const constraints = await this.getConstraintList();

      return {
        tables,
        indexes,
        constraints,
        tableCount: tables.length,
        indexCount: indexes.length,
        constraintCount: constraints.length,
      };
    } catch (error) {
      this.logger.error('Failed to get schema info:', error);
      return null;
    }
  }

  /**
   * Private helper methods
   */
  private async ensureMigrationsTable(): Promise<void> {
    await this.db.execute(sql`
      CREATE TABLE IF NOT EXISTS __drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash TEXT NOT NULL,
        created_at BIGINT
      )
    `);
  }

  private async getAppliedMigrations(): Promise<MigrationInfo[]> {
    try {
      const result = await this.db.execute(sql`
        SELECT hash as id, created_at 
        FROM __drizzle_migrations 
        ORDER BY created_at ASC
      `);

      return result.map(row => ({
        id: row.hash as string,
        name: row.hash as string,
        executedAt: new Date(Number(row.created_at)),
        success: true,
      }));
    } catch (error) {
      this.logger.debug('Migrations table does not exist or is empty');
      return [];
    }
  }

  private getAvailableMigrations(): string[] {
    if (!fs.existsSync(this.migrationsPath)) {
      return [];
    }

    return fs
      .readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();
  }

  private async getTableList(): Promise<string[]> {
    const result = await this.db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    return result.map(row => row.table_name as string);
  }

  private async getIndexList(): Promise<string[]> {
    const result = await this.db.execute(sql`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY indexname
    `);

    return result.map(row => row.indexname as string);
  }

  private async getConstraintList(): Promise<string[]> {
    const result = await this.db.execute(sql`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_schema = 'public'
      ORDER BY constraint_name
    `);

    return result.map(row => row.constraint_name as string);
  }
}
