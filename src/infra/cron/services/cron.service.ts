import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as PgBoss from 'pg-boss';

import { QUEUE_NAMES } from '../../queue/types/queue.types';

@Injectable()
export class CronService implements OnModuleInit {
  private readonly logger = new Logger(CronService.name);

  constructor(@Inject('PG_BOSS') private readonly boss: PgBoss) {}

  async onModuleInit() {
    await this.setupPgBossWorkers();
  }

  // @nestjs/schedule triggers that enqueue jobs to pg-boss
  @Cron('0 */6 * * *') // Every 6 hours
  async scheduleHealthCheck() {
    this.logger.log('Scheduling health check job...');
    await this.boss.send(QUEUE_NAMES.HEALTH_CHECK, {
      scheduledAt: new Date().toISOString(),
      type: 'health-check',
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async scheduleDailyCleanup() {
    this.logger.log('Scheduling daily cleanup job...');
    await this.boss.send(QUEUE_NAMES.DAILY_CLEANUP, {
      scheduledAt: new Date().toISOString(),
      type: 'daily-cleanup',
    });
  }

  @Cron('0 2 * * *') // Daily at 2 AM
  async scheduleHeavyProcessing() {
    this.logger.log('Scheduling heavy processing job...');
    await this.boss.send(QUEUE_NAMES.HEAVY_PROCESSING, {
      scheduledAt: new Date().toISOString(),
      type: 'heavy-processing',
    });
  }

  @Cron('0 0 1 * *') // Monthly on the 1st
  async scheduleMonthlyReport() {
    this.logger.log('Scheduling monthly report job...');
    await this.boss.send(QUEUE_NAMES.MONTHLY_REPORT, {
      scheduledAt: new Date().toISOString(),
      type: 'monthly-report',
    });
  }

  @Cron('*/5 * * * *') // Every 5 minutes (keeping the original sample for demo)
  async scheduleSampleJob() {
    this.logger.log('Scheduling sample cron job...');
    await this.boss.send(QUEUE_NAMES.CRON_SAMPLE, {
      scheduledAt: new Date().toISOString(),
      type: 'sample-cron',
    });
  }

  // pg-boss workers that actually execute the jobs
  private async setupPgBossWorkers(): Promise<void> {
    await this.setupSampleJobWorker();
    await this.setupHealthCheckWorker();
    await this.setupDailyCleanupWorker();
    await this.setupHeavyProcessingWorker();
    await this.setupMonthlyReportWorker();
  }

  private async setupSampleJobWorker(): Promise<void> {
    const jobName = QUEUE_NAMES.CRON_SAMPLE;

    try {
      await this.boss.createQueue(jobName);

      await this.boss.work(jobName, async (job: any) => {
        this.logger.log(`Executing sample cron job: ${job.id}`);

        const result = {
          executedAt: new Date().toISOString(),
          jobId: job.id || 'unknown',
          jobName: jobName,
          message: 'Sample cron job executed successfully via pg-boss',
        };

        this.logger.log('Sample cron job completed:', result);
        return result;
      });

      this.logger.log('Sample cron job worker registered');
    } catch (error) {
      this.logger.error('Failed to setup sample cron job worker:', error);
    }
  }

  private async setupHealthCheckWorker(): Promise<void> {
    const jobName = QUEUE_NAMES.HEALTH_CHECK;

    try {
      await this.boss.createQueue(jobName);

      await this.boss.work(jobName, async (job: any) => {
        this.logger.log(`Executing health check job: ${job.id}`);

        // Your actual health check logic here
        const healthStatus = await this.performHealthCheck();

        this.logger.log('Health check completed', {
          jobId: job.id,
          status: healthStatus,
        });
        return { status: healthStatus, completedAt: new Date().toISOString() };
      });

      this.logger.log('Health check worker registered');
    } catch (error) {
      this.logger.error('Failed to setup health check worker:', error);
    }
  }

  private async setupDailyCleanupWorker(): Promise<void> {
    const jobName = QUEUE_NAMES.DAILY_CLEANUP;

    try {
      await this.boss.createQueue(jobName);

      await this.boss.work(jobName, async (job: any) => {
        this.logger.log(`Executing daily cleanup job: ${job.id}`);

        // Your cleanup logic here
        const cleanupResult = await this.performDailyCleanup();

        this.logger.log('Daily cleanup completed', {
          jobId: job.id,
          result: cleanupResult,
        });
        return { result: cleanupResult, completedAt: new Date().toISOString() };
      });

      this.logger.log('Daily cleanup worker registered');
    } catch (error) {
      this.logger.error('Failed to setup daily cleanup worker:', error);
    }
  }

  private async setupHeavyProcessingWorker(): Promise<void> {
    const jobName = QUEUE_NAMES.HEAVY_PROCESSING;

    try {
      await this.boss.createQueue(jobName);

      await this.boss.work(jobName, async (job: any) => {
        this.logger.log(`Executing heavy processing job: ${job.id}`);

        // Your heavy processing logic here
        const processingResult = await this.performHeavyProcessing(job.data);

        this.logger.log('Heavy processing completed', { jobId: job.id });
        return {
          result: processingResult,
          completedAt: new Date().toISOString(),
        };
      });

      this.logger.log('Heavy processing worker registered');
    } catch (error) {
      this.logger.error('Failed to setup heavy processing worker:', error);
    }
  }

  private async setupMonthlyReportWorker(): Promise<void> {
    const jobName = QUEUE_NAMES.MONTHLY_REPORT;

    try {
      await this.boss.createQueue(jobName);

      await this.boss.work(jobName, async (job: any) => {
        this.logger.log(`Executing monthly report job: ${job.id}`);

        // Your report generation logic here
        const reportResult = await this.generateMonthlyReport(job.data);

        this.logger.log('Monthly report completed', { jobId: job.id });
        return { result: reportResult, completedAt: new Date().toISOString() };
      });

      this.logger.log('Monthly report worker registered');
    } catch (error) {
      this.logger.error('Failed to setup monthly report worker:', error);
    }
  }

  // Your actual business logic methods
  private async performHealthCheck(): Promise<any> {
    // Simulate health check logic
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
    return {
      database: 'healthy',
      cache: 'healthy',
      external_apis: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }

  private async performDailyCleanup(): Promise<any> {
    // Simulate cleanup logic
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay
    return {
      cleaned_records: Math.floor(Math.random() * 1000),
      freed_space: `${Math.floor(Math.random() * 1000)}MB`,
      timestamp: new Date().toISOString(),
    };
  }

  private async performHeavyProcessing(_data: any): Promise<any> {
    // Simulate heavy processing logic
    await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 second delay
    return {
      processed_items: Math.floor(Math.random() * 10000),
      duration: `${Math.floor(Math.random() * 60)} minutes`,
      timestamp: new Date().toISOString(),
    };
  }

  private async generateMonthlyReport(_data: any): Promise<any> {
    // Simulate report generation logic
    await new Promise((resolve) => setTimeout(resolve, 3000)); // 3 second delay
    return {
      report_id: `RPT-${Date.now()}`,
      pages: Math.floor(Math.random() * 100),
      generated_at: new Date().toISOString(),
    };
  }

  // Utility methods for manual job scheduling
  async scheduleJobNow(jobName: string, data?: any): Promise<string | null> {
    return await this.boss.send(jobName, data);
  }

  async scheduleJobLater(
    jobName: string,
    data: any,
    delayInSeconds: number,
  ): Promise<string | null> {
    return await this.boss.send(jobName, data, { startAfter: delayInSeconds });
  }

  // Method to schedule additional custom cron jobs
  async scheduleCustomCronJob(jobName: string, data?: any): Promise<void> {
    try {
      await this.boss.send(jobName, data);
      this.logger.log(`Scheduled custom job "${jobName}"`);
    } catch (error) {
      this.logger.error(`Failed to schedule custom job "${jobName}":`, error);
      throw error;
    }
  }

  // Method to stop workers
  async stopWorker(jobName: string): Promise<void> {
    try {
      this.logger.log(`Stopped worker for: ${jobName}`);
    } catch (error) {
      this.logger.error(`Failed to stop worker "${jobName}":`, error);
      throw error;
    }
  }

  // Get job status and monitoring
  async getJobStatus(queueName: string, jobId: string): Promise<any> {
    try {
      return await this.boss.getJobById(queueName, jobId);
    } catch (error) {
      this.logger.error(`Failed to get job status for "${jobId}":`, error);
      return null;
    }
  }
}
