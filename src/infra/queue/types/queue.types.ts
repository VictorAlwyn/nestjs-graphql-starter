import * as PgBoss from 'pg-boss';

// Job data interfaces
export interface NotificationJobData {
  userId: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
}

export interface ImageProcessingJobData {
  imageUrl: string;
  operations: string[];
  outputFormat?: string;
}

// Job options for pg-boss
export interface QueueJobOptions {
  priority?: number;
  delay?: number;
  startAfter?: number | string | Date;
  singletonKey?: string;
  singletonSeconds?: number;
  retryLimit?: number;
  retryDelay?: number;
  retryBackoff?: boolean;
  expireInHours?: number;
  expireInMinutes?: number;
  expireInSeconds?: number;
  keepUntil?: Date | string;
  onComplete?: boolean;
  deadLetter?: string;
}

// Worker options extending PG Boss work options
export interface QueueWorkerOptions extends Partial<PgBoss.WorkOptions> {
  concurrency?: number;
  newJobCheckInterval?: number;
  expireInSeconds?: number;
}

// Generic job result interface
export interface JobResult {
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: string;
}

// Queue statistics interface
export interface QueueStats {
  name: string;
  size: number;
  processing: number;
  completed: number;
  failed: number;
}

// Predefined queue names for type safety
export const QUEUE_NAMES = {
  EMAIL: 'email-queue',
  CRON_SAMPLE: 'cron-sample',
  HEALTH_CHECK: 'health-check',
  DAILY_CLEANUP: 'daily-cleanup',
  HEAVY_PROCESSING: 'heavy-processing',
  MONTHLY_REPORT: 'monthly-report',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
