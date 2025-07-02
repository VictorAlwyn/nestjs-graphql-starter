import { Global, Module, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, PoolConfig } from 'pg';

import { DRIZZLE, DATABASE_POOL } from './constants';
import { DatabaseService } from './database.service';
import { DatabaseHealthService } from './database-health.service';
import { DatabaseMigrationService } from './database-migration.service';
import * as schema from './schemas';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('DatabaseModule');
        const databaseUrl = configService.getOrThrow<string>('DATABASE_URL');
        const dbConfig = configService.get('database', {});

        const poolConfig: PoolConfig = {
          connectionString: databaseUrl,
          // Connection pool configuration
          min: dbConfig.pool?.min || 2,
          max: dbConfig.pool?.max || 10,
          idleTimeoutMillis: dbConfig.pool?.idleTimeout || 30000,
          connectionTimeoutMillis: dbConfig.pool?.connectionTimeout || 2000,
          // Connection retry configuration
          allowExitOnIdle: false,
          // SSL configuration for production
          ssl:
            process.env.NODE_ENV === 'production'
              ? { rejectUnauthorized: false }
              : false,
          // Query timeout
          query_timeout: 30000,
          // Statement timeout
          statement_timeout: 30000,
          // Connection validation
          application_name: configService.get(
            'appName',
            'NestJS GraphQL Starter',
          ),
        };

        const pool = new Pool(poolConfig);

        // Pool event handlers for monitoring
        pool.on('connect', (client) => {
          logger.debug(
            `New database client connected (total: ${pool.totalCount})`,
          );
        });

        pool.on('acquire', (client) => {
          logger.debug(
            `Database client acquired (idle: ${pool.idleCount}, total: ${pool.totalCount})`,
          );
        });

        pool.on('remove', (client) => {
          logger.debug(`Database client removed (total: ${pool.totalCount})`);
        });

        pool.on('error', (err, client) => {
          logger.error('Database pool error:', err);
        });

        // Test initial connection
        pool
          .connect()
          .then((client) => {
            logger.log('✅ Database connection established successfully');
            client.release();
          })
          .catch((err) => {
            logger.error('❌ Failed to establish database connection:', err);
          });

        return pool;
      },
    },
    {
      provide: DRIZZLE,
      inject: [DATABASE_POOL, ConfigService],
      useFactory: (pool: Pool, configService: ConfigService) => {
        const logger = new Logger('DrizzleORM');

        const db = drizzle(pool, {
          schema,
          logger:
            process.env.NODE_ENV === 'development'
              ? {
                  logQuery: (query, params) => {
                    logger.debug(`Query: ${query}`);
                    if (params && params.length > 0) {
                      logger.debug(`Params: ${JSON.stringify(params)}`);
                    }
                  },
                }
              : false,
        });

        return db;
      },
    },
    DatabaseService,
    DatabaseHealthService,
    DatabaseMigrationService,
  ],
  exports: [
    DRIZZLE,
    DATABASE_POOL,
    DatabaseService,
    DatabaseHealthService,
    DatabaseMigrationService,
  ],
})
export class DatabaseModule implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async onModuleDestroy() {
    this.logger.log('Closing database connections...');
    try {
      await this.pool.end();
      this.logger.log('✅ Database connections closed successfully');
    } catch (error) {
      this.logger.error('❌ Error closing database connections:', error);
    }
  }
}
