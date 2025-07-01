import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as PgBoss from 'pg-boss';

import { JobPayload } from '../types/job-payloads';
import { QUEUE_NAMES, QueueJobOptions } from '../types/queue.types';
import { EmailQueueWorker } from '../workers/email-queue.worker';

@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @Inject('PG_BOSS') private readonly boss: PgBoss,
    private readonly emailQueueWorker: EmailQueueWorker,
  ) {}

  async onModuleInit() {
    await this.setupQueueWorkers();
  }

  // Setup all queue workers
  private async setupQueueWorkers(): Promise<void> {
    await this.setupEmailWorker();
    // Add more workers here as needed
  }

  private async setupEmailWorker(): Promise<void> {
    const queueName = QUEUE_NAMES.EMAIL;

    try {
      await this.boss.createQueue(queueName);

      await this.boss.work(queueName, async (jobs: any) => {
        // pg-boss can pass either a single job or an array of jobs
        const jobsArray = Array.isArray(jobs) ? jobs : [jobs];

        for (const job of jobsArray) {
          this.logger.log(`Processing email job: ${job?.id || 'unknown-id'}`);

          const result = await this.emailQueueWorker.processEmailJob(job);

          this.logger.log('Email job completed', {
            jobId: job?.id || 'unknown-id',
            recipient: result.recipient,
          });
        }
      });

      this.logger.log('Email worker registered');
    } catch (error) {
      this.logger.error('Failed to setup email worker:', error);
    }
  }

  // Public methods for adding jobs to queues
  async addEmailJob(
    data: {
      to: string;
      subject: string;
      body?: string;
      html?: string;
      from?: string;
    },
    options?: QueueJobOptions,
  ): Promise<string | null> {
    const emailJobPayload = {
      ...data,
      type: 'email' as const,
      scheduledAt: new Date().toISOString(),
    };
    return this.addJob(QUEUE_NAMES.EMAIL, emailJobPayload, options);
  }

  async addJob<T extends JobPayload>(
    queueName: string,
    data: T,
    options?: QueueJobOptions,
  ): Promise<string | null> {
    try {
      const jobId = await this.boss.send(queueName, data, options || {});
      this.logger.log(`Job added to queue "${queueName}" with ID: ${jobId}`);
      return jobId;
    } catch (error) {
      this.logger.error(`Failed to add job to queue "${queueName}":`, error);
      throw error;
    }
  }

  // Job management methods
  async getJobById(
    queueName: string,
    jobId: string,
  ): Promise<PgBoss.Job | null> {
    try {
      return await this.boss.getJobById(queueName, jobId);
    } catch (error) {
      this.logger.error(
        `Failed to get job with ID "${jobId}" from queue "${queueName}":`,
        error,
      );
      return null;
    }
  }

  async cancelJob(queueName: string, jobId: string): Promise<void> {
    try {
      await this.boss.cancel(queueName, jobId);
      this.logger.log(`Job cancelled: ${jobId} from queue: ${queueName}`);
    } catch (error) {
      this.logger.error(
        `Failed to cancel job "${jobId}" from queue "${queueName}":`,
        error,
      );
      throw error;
    }
  }

  async getQueueSize(queueName: string): Promise<number> {
    try {
      return await this.boss.getQueueSize(queueName);
    } catch (error) {
      this.logger.error(`Failed to get queue size for "${queueName}":`, error);
      return 0;
    }
  }

  // Worker management methods
  async stopWorker(queueName: string): Promise<void> {
    try {
      await this.boss.offWork(queueName);
      this.logger.log(`Worker stopped for queue: ${queueName}`);
    } catch (error) {
      this.logger.error(
        `Failed to stop worker for queue "${queueName}":`,
        error,
      );
      throw error;
    }
  }

  async getQueueStatus(queueName: string): Promise<{
    queueName: string;
    size: number;
    timestamp: string;
  } | null> {
    try {
      const size = await this.getQueueSize(queueName);
      return {
        queueName,
        size,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to get status for queue "${queueName}":`,
        error,
      );
      return null;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      // Check if pg-boss is connected and responsive
      await this.boss.getQueueSize(QUEUE_NAMES.EMAIL);
      return true;
    } catch (error) {
      this.logger.error('Queue health check failed:', error);
      return false;
    }
  }

  // Utility method to add custom workers
  async addCustomWorker(
    queueName: string,
    handler: (job: any) => Promise<any>,
  ): Promise<void> {
    try {
      await this.boss.createQueue(queueName);

      await this.boss.work(queueName, async (job: any) => {
        this.logger.log(
          `Processing custom job in queue "${queueName}": ${job.id}`,
        );

        const result = await handler(job);

        this.logger.log(`Custom job completed in queue "${queueName}"`, {
          jobId: job.id,
        });
        return result;
      });

      this.logger.log(`Custom worker registered for queue: ${queueName}`);
    } catch (error) {
      this.logger.error(
        `Failed to setup custom worker for queue "${queueName}":`,
        error,
      );
      throw error;
    }
  }
}
