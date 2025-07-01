import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppLoggerService extends Logger {
  constructor(context: string = 'Application') {
    super(context);
  }

  /**
   * Log GraphQL operations
   */
  logGraphQL(operation: string, variables?: Record<string, unknown>): void {
    this.log(`GraphQL ${operation}`);
    if (variables && Object.keys(variables).length > 0) {
      this.debug(`Variables: ${JSON.stringify(variables)}`);
    }
  }

  /**
   * Log database operations
   */
  logDatabase(operation: string, table?: string): void {
    const message = table
      ? `Database ${operation} on ${table}`
      : `Database ${operation}`;
    this.log(message);
  }

  /**
   * Log authentication events
   */
  logAuth(event: string, userId?: string): void {
    const message = userId
      ? `Auth ${event} for user ${userId}`
      : `Auth ${event}`;
    this.log(message);
  }

  /**
   * Log performance metrics
   */
  logPerformance(operation: string, duration: number): void {
    this.log(`Performance: ${operation} took ${duration}ms`);
  }

  /**
   * Log API requests
   */
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
  ): void {
    this.log(`Request: ${method} ${url} - ${statusCode} (${duration}ms)`);
  }
}
