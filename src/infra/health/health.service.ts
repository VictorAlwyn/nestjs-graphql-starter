import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthIndicatorResult, HealthIndicator } from '@nestjs/terminus';

import { DatabaseService } from '../database/database.service';
import { EmailService } from '../email/email.service';
import { QueueService } from '../queue/services/queue.service';

@Injectable()
export class HealthService extends HealthIndicator {
  constructor(
    private readonly queueService: QueueService,
    private readonly emailService: EmailService,
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async checkQueueHealth(): Promise<HealthIndicatorResult> {
    try {
      const isHealthy = await this.queueService.isHealthy();
      return this.getStatus('queue', isHealthy);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.getStatus('queue', false, { message });
    }
  }

  async checkEmailService(): Promise<HealthIndicatorResult> {
    try {
      const isHealthy = await this.emailService.verifyConnection();
      return this.getStatus('email', isHealthy);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.getStatus('email', false, { message });
    }
  }

  async getDetailedHealth(
    includeQueue = false,
  ): Promise<Record<string, unknown>> {
    const health: Record<string, unknown> = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: this.configService.get<string>('npm_package_version', '1.0.0'),
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: await this.checkDatabaseHealth(),
    };

    if (includeQueue) {
      health.queue = await this.getQueueHealth();
    }

    // For test compatibility, add a 'details' field
    health.details = {
      database: health.database,
      memory: health.memory,
      queue: health.queue,
    };

    return health;
  }

  async getMetrics(): Promise<Record<string, unknown>> {
    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      queue: await this.getQueueMetrics(),
    };
  }

  async checkDatabaseHealth(): Promise<HealthIndicatorResult> {
    try {
      const isConnected = await this.databaseService.isConnected();
      return this.getStatus('database', isConnected);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.getStatus('database', false, { message });
    }
  }

  private async getQueueHealth(): Promise<Record<string, unknown>> {
    try {
      const queues = ['email-queue', 'health-check', 'daily-cleanup'];
      const health: Record<string, unknown> = {};

      for (const queueName of queues) {
        const status = await this.queueService.getQueueStatus(queueName);
        health[queueName] = status || null;
      }

      return health;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        error: message,
      };
    }
  }

  private async getQueueMetrics(): Promise<Record<string, unknown>> {
    try {
      const queues = ['email-queue', 'health-check', 'daily-cleanup'];
      const metrics: Record<string, unknown> = {};

      for (const queueName of queues) {
        const size = await this.queueService.getQueueSize(queueName);
        metrics[queueName] = { size };
      }

      return metrics;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        error: message,
      };
    }
  }
}
