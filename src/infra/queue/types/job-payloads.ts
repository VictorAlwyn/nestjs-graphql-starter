// Base job payload interface
export interface BaseJobPayload {
  scheduledAt: string;
  type: string;
}

// Email job payload
export interface EmailJobPayload extends BaseJobPayload {
  type: 'email';
  to: string;
  subject: string;
  body?: string;
  html?: string;
  from?: string;
  template?: {
    name: string;
    data: Record<string, unknown>;
  };
}

// Health check job payload
export interface HealthCheckJobPayload extends BaseJobPayload {
  type: 'health-check';
  checkType?: 'full' | 'database' | 'queue' | 'email';
}

// Daily cleanup job payload
export interface DailyCleanupJobPayload extends BaseJobPayload {
  type: 'daily-cleanup';
  cleanupType?: 'logs' | 'temp-files' | 'expired-sessions';
  retentionDays?: number;
}

// Heavy processing job payload
export interface HeavyProcessingJobPayload extends BaseJobPayload {
  type: 'heavy-processing';
  taskType: 'data-analysis' | 'report-generation' | 'batch-processing';
  parameters?: Record<string, unknown>;
}

// Monthly report job payload
export interface MonthlyReportJobPayload extends BaseJobPayload {
  type: 'monthly-report';
  reportType: 'user-activity' | 'system-metrics' | 'financial';
  month: string; // YYYY-MM format
  includeCharts?: boolean;
}

// Union type for all job payloads
export type JobPayload =
  | EmailJobPayload
  | HealthCheckJobPayload
  | DailyCleanupJobPayload
  | HeavyProcessingJobPayload
  | MonthlyReportJobPayload;

// Type guards for job payloads
export function isEmailJobPayload(
  payload: unknown,
): payload is EmailJobPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'type' in payload &&
    payload.type === 'email'
  );
}

export function isHealthCheckJobPayload(
  payload: unknown,
): payload is HealthCheckJobPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'type' in payload &&
    payload.type === 'health-check'
  );
}

export function isDailyCleanupJobPayload(
  payload: unknown,
): payload is DailyCleanupJobPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'type' in payload &&
    payload.type === 'daily-cleanup'
  );
}

export function isHeavyProcessingJobPayload(
  payload: unknown,
): payload is HeavyProcessingJobPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'type' in payload &&
    payload.type === 'heavy-processing'
  );
}

export function isMonthlyReportJobPayload(
  payload: unknown,
): payload is MonthlyReportJobPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'type' in payload &&
    payload.type === 'monthly-report'
  );
}
