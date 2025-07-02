import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { DRIZZLE, DATABASE_POOL } from './constants';
import * as schema from './schemas';

export interface DatabaseInfo {
  connected: boolean;
  version?: string;
  databaseName?: string;
  host?: string;
  port?: number;
  poolStats: {
    total: number;
    idle: number;
    waiting: number;
  };
}

export interface TransactionOptions {
  timeout?: number;
  isolationLevel?:
    | 'READ UNCOMMITTED'
    | 'READ COMMITTED'
    | 'REPEATABLE READ'
    | 'SERIALIZABLE';
}

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @Inject(DRIZZLE) public drizzle: NodePgDatabase<typeof schema>,
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Test database connection
   */
  async isConnected(): Promise<boolean> {
    try {
      await this.drizzle.execute(sql`SELECT 1`);
      return true;
    } catch (error) {
      this.logger.error('Database connection test failed:', error);
      return false;
    }
  }

  /**
   * Get comprehensive database information
   */
  async getDatabaseInfo(): Promise<DatabaseInfo> {
    const poolStats = {
      total: this.pool.totalCount,
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount,
    };

    try {
      const versionResult = await this.drizzle.execute(sql`SELECT version()`);
      const dbNameResult = await this.drizzle.execute(
        sql`SELECT current_database()`,
      );

      return {
        connected: true,
        version: versionResult[0]?.version as string,
        databaseName: dbNameResult[0]?.current_database as string,
        host: this.configService.get('database.host'),
        port: this.configService.get('database.port'),
        poolStats,
      };
    } catch (error) {
      this.logger.error('Failed to get database info:', error);
      return {
        connected: false,
        poolStats,
      };
    }
  }

  /**
   * Execute a transaction with proper error handling and timeout
   */
  async executeTransaction<T>(
    callback: (tx: NodePgDatabase<typeof schema>) => Promise<T>,
    options: TransactionOptions = {},
  ): Promise<T> {
    const { timeout = 30000, isolationLevel } = options;

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Transaction timeout after ${timeout}ms`));
      }, timeout);

      this.drizzle
        .transaction(async (tx) => {
          try {
            // Set isolation level if specified
            if (isolationLevel) {
              await tx.execute(
                sql`SET TRANSACTION ISOLATION LEVEL ${sql.raw(isolationLevel)}`,
              );
            }

            const result = await callback(tx);
            clearTimeout(timeoutId);
            resolve(result);
          } catch (error) {
            clearTimeout(timeoutId);
            this.logger.error('Transaction failed:', error);
            throw error;
          }
        })
        .catch(reject);
    });
  }

  /**
   * Execute raw SQL with parameters
   */
  async executeRawQuery<T = unknown>(
    query: string,
    params: unknown[] = [],
  ): Promise<T[]> {
    try {
      this.logger.debug(`Executing raw query: ${query}`);
      if (params.length > 0) {
        this.logger.debug(`Query parameters: ${JSON.stringify(params)}`);
      }

      const result = await this.drizzle.execute(sql.raw(query, ...params));
      return result as T[];
    } catch (error) {
      this.logger.error('Raw query execution failed:', error);
      throw error;
    }
  }

  /**
   * Get connection pool statistics
   */
  getPoolStats() {
    return {
      totalConnections: this.pool.totalCount,
      idleConnections: this.pool.idleCount,
      waitingConnections: this.pool.waitingCount,
      maxConnections: this.configService.get('database.pool.max', 10),
      minConnections: this.configService.get('database.pool.min', 2),
    };
  }

  /**
   * Ping database with timing
   */
  async ping(): Promise<{ success: boolean; responseTime: number }> {
    const startTime = Date.now();
    try {
      await this.drizzle.execute(sql`SELECT 1`);
      return {
        success: true,
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error('Database ping failed:', error);
      return {
        success: false,
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Close all database connections (for graceful shutdown)
   */
  async close(): Promise<void> {
    try {
      await this.pool.end();
      this.logger.log('Database connections closed successfully');
    } catch (error) {
      this.logger.error('Error closing database connections:', error);
      throw error;
    }
  }

  /**
   * Get database size and statistics
   */
  async getDatabaseStats() {
    try {
      const sizeQuery = sql`
        SELECT
          pg_size_pretty(pg_database_size(current_database())) as database_size,
          (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') as table_count,
          (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections
      `;

      const result = await this.drizzle.execute(sizeQuery);
      return result[0];
    } catch (error) {
      this.logger.error('Failed to get database stats:', error);
      return null;
    }
  }

  /**
   * Vacuum database tables for maintenance
   */
  async vacuumDatabase(analyze = true): Promise<void> {
    try {
      this.logger.log('Starting database vacuum...');

      if (analyze) {
        await this.drizzle.execute(sql`VACUUM ANALYZE`);
        this.logger.log('Database vacuum with analyze completed');
      } else {
        await this.drizzle.execute(sql`VACUUM`);
        this.logger.log('Database vacuum completed');
      }
    } catch (error) {
      this.logger.error('Database vacuum failed:', error);
      throw error;
    }
  }
}
