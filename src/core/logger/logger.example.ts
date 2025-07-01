import { Injectable } from '@nestjs/common';

import { AppLoggerService } from './logger.service';

/**
 * Example service showing how to use the custom logger
 */
@Injectable()
export class ExampleService {
  private readonly logger = new AppLoggerService('ExampleService');

  async performOperation(): Promise<void> {
    const startTime = Date.now();

    try {
      this.logger.log('Starting operation');

      // Simulate some work
      await this.someAsyncWork();

      const duration = Date.now() - startTime;
      this.logger.logPerformance('performOperation', duration);

      this.logger.log('Operation completed successfully');
    } catch (error) {
      this.logger.error(
        'Operation failed',
        error instanceof Error ? error.stack : 'Unknown error',
      );
      throw error;
    }
  }

  async someAsyncWork(): Promise<void> {
    this.logger.debug('Performing async work');
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

/**
 * Example GraphQL resolver showing logger usage
 */
@Injectable()
export class ExampleResolver {
  private readonly logger = new AppLoggerService('ExampleResolver');

  async getData(variables: Record<string, unknown>): Promise<unknown> {
    this.logger.logGraphQL('getData', variables);

    try {
      // Your GraphQL logic here
      const result = await this.fetchData();
      this.logger.log('Data fetched successfully');
      return result;
    } catch (error) {
      this.logger.error(
        'Failed to fetch data',
        error instanceof Error ? error.stack : 'Unknown error',
      );
      throw error;
    }
  }

  private async fetchData(): Promise<unknown> {
    // Simulate data fetching with async operation
    await new Promise((resolve) => setTimeout(resolve, 50));
    return { id: 1, name: 'Example' };
  }
}

/**
 * Example database service showing logger usage
 */
@Injectable()
export class ExampleDatabaseService {
  private readonly logger = new AppLoggerService('DatabaseService');

  async createUser(
    userData: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    this.logger.logDatabase('CREATE', 'users');

    try {
      // Your database operation here
      const user = await this.insertUser(userData);
      this.logger.logAuth('USER_CREATED', user.id as string);
      return user;
    } catch (error) {
      this.logger.error(
        'Failed to create user',
        error instanceof Error ? error.stack : 'Unknown error',
      );
      throw error;
    }
  }

  private async insertUser(
    userData: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    // Simulate database insertion with async operation
    await new Promise((resolve) => setTimeout(resolve, 50));
    return { id: '123', ...userData };
  }
}
