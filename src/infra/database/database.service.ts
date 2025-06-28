import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { databaseConfig, validateDatabaseConfig } from './database.config';
import * as schema from './schemas';

export type Database = ReturnType<typeof drizzle<typeof schema>>;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private client: postgres.Sql | null = null;
  private database: Database | null = null;

  public async onModuleInit(): Promise<void> {
    try {
      validateDatabaseConfig();

      this.logger.log('Initializing database connection...');

      // Create PostgreSQL client
      this.client = postgres(databaseConfig.url, {
        max: 20, // Maximum number of connections
        idle_timeout: 20,
        connect_timeout: 10,
        prepare: false,
      });

      // Initialize Drizzle with schema
      this.database = drizzle(this.client, { schema });

      // Test connection
      await this.client`SELECT 1`;

      this.logger.log('Database connection established successfully');
    } catch (error) {
      this.logger.error('Failed to initialize database connection:', error);
      throw error;
    }
  }

  public async onModuleDestroy(): Promise<void> {
    if (this.client) {
      this.logger.log('Closing database connection...');
      await this.client.end();
      this.client = null;
      this.database = null;
      this.logger.log('Database connection closed');
    }
  }

  public getDatabase(): Database {
    if (!this.database) {
      throw new Error(
        'Database not initialized. Make sure the module is properly loaded.',
      );
    }
    return this.database;
  }

  public getClient(): postgres.Sql {
    if (!this.client) {
      throw new Error(
        'Database client not initialized. Make sure the module is properly loaded.',
      );
    }
    return this.client;
  }

  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.client) return false;
      await this.client`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
