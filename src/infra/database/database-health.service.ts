import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { DRIZZLE, DATABASE_POOL } from './constants';
import * as schema from './schemas';

export interface DatabaseHealthInfo {
  status: 'healthy' | 'unhealthy';
  message: string;
  details: {
    connection: boolean;
    poolStats: {
      totalCount: number;
      idleCount: number;
      waitingCount: number;
    };
    queryTime: number;
    version?: string;
    uptime?: number;
  };
  timestamp: string;
}

export interface DatabaseMetrics {
  activeConnections: number;
  idleConnections: number;
  waitingConnections: number;
  totalConnections: number;
  queryCount: number;
  averageQueryTime: number;
  slowQueries: number;
  errors: number;
}

@Injectable()
export class DatabaseHealthService {
  private readonly logger = new Logger(DatabaseHealthService.name);
  private queryCount = 0;
  private totalQueryTime = 0;
  private slowQueries = 0;
  private errors = 0;

  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Perform comprehensive health check
   */
  async checkHealth(): Promise<DatabaseHealthInfo> {
    const startTime = Date.now();
    let status: 'healthy' | 'unhealthy' = 'unhealthy';
    let message = 'Database is unhealthy';
    let connection = false;
    let version: string | undefined;
    let uptime: number | undefined;

    try {
      // Test basic connectivity
      const result = await this.db.execute(sql`SELECT 1 as test`);
      connection = result.length > 0;

      if (connection) {
        // Get database version
        const versionResult = await this.db.execute(sql`SELECT version()`);
        version = versionResult[0]?.version as string;

        // Get database uptime (PostgreSQL specific)
        const uptimeResult = await this.db.execute(
          sql`SELECT EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time())) as uptime`
        );
        uptime = Number(uptimeResult[0]?.uptime);

        status = 'healthy';
        message = 'Database is healthy';
      }
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      this.errors++;
      message = `Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    const queryTime = Date.now() - startTime;
    this.queryCount++;
    this.totalQueryTime += queryTime;

    if (queryTime > 1000) {
      this.slowQueries++;
    }

    return {
      status,
      message,
      details: {
        connection,
        poolStats: {
          totalCount: this.pool.totalCount,
          idleCount: this.pool.idleCount,
          waitingCount: this.pool.waitingCount,
        },
        queryTime,
        version,
        uptime,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get database metrics
   */
  getMetrics(): DatabaseMetrics {
    return {
      activeConnections: this.pool.totalCount - this.pool.idleCount,
      idleConnections: this.pool.idleCount,
      waitingConnections: this.pool.waitingCount,
      totalConnections: this.pool.totalCount,
      queryCount: this.queryCount,
      averageQueryTime: this.queryCount > 0 ? this.totalQueryTime / this.queryCount : 0,
      slowQueries: this.slowQueries,
      errors: this.errors,
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.queryCount = 0;
    this.totalQueryTime = 0;
    this.slowQueries = 0;
    this.errors = 0;
  }

  /**
   * Check if database is ready for connections
   */
  async isReady(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      return health.status === 'healthy';
    } catch {
      return false;
    }
  }

  /**
   * Get detailed connection pool information
   */
  getPoolInfo() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
      maxConnections: this.configService.get('database.pool.max', 10),
      minConnections: this.configService.get('database.pool.min', 2),
      connectionTimeoutMs: this.configService.get('database.pool.connectionTimeout', 2000),
      idleTimeoutMs: this.configService.get('database.pool.idleTimeout', 30000),
    };
  }

  /**
   * Test database performance with a simple query
   */
  async testPerformance(): Promise<{ queryTime: number; success: boolean }> {
    const startTime = Date.now();
    try {
      await this.db.execute(sql`SELECT pg_sleep(0.001)`); // 1ms sleep
      return {
        queryTime: Date.now() - startTime,
        success: true,
      };
    } catch (error) {
      this.logger.error('Performance test failed:', error);
      return {
        queryTime: Date.now() - startTime,
        success: false,
      };
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats() {
    try {
      // Get database size
      const sizeResult = await this.db.execute(
        sql`SELECT pg_size_pretty(pg_database_size(current_database())) as size`
      );

      // Get table count
      const tableCountResult = await this.db.execute(
        sql`SELECT count(*) as table_count FROM information_schema.tables WHERE table_schema = 'public'`
      );

      // Get active connections
      const connectionsResult = await this.db.execute(
        sql`SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = 'active'`
      );

      return {
        databaseSize: sizeResult[0]?.size,
        tableCount: Number(tableCountResult[0]?.table_count),
        activeConnections: Number(connectionsResult[0]?.active_connections),
      };
    } catch (error) {
      this.logger.error('Failed to get database stats:', error);
      return null;
    }
  }

  /**
   * Monitor connection pool and log warnings
   */
  monitorPool(): void {
    const poolInfo = this.getPoolInfo();
    const utilizationPercent = (poolInfo.totalCount / poolInfo.maxConnections) * 100;

    if (utilizationPercent > 80) {
      this.logger.warn(
        `High database connection pool utilization: ${utilizationPercent.toFixed(1)}% (${poolInfo.totalCount}/${poolInfo.maxConnections})`
      );
    }

    if (poolInfo.waitingCount > 0) {
      this.logger.warn(
        `Database connections waiting in queue: ${poolInfo.waitingCount}`
      );
    }
  }
}
