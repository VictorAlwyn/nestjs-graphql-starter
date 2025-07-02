import { z } from 'zod';

/**
 * Environment validation schema using Zod
 * This ensures all required environment variables are present and valid
 */
export const configurationSchema = z.object({
  // Application Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().min(1).max(65535).default(3000),
  APP_NAME: z.string().default('NestJS GraphQL Starter'),
  APP_VERSION: z.string().default('1.0.0'),

  // Database Configuration
  DATABASE_URL: z.string().url(),
  DB_POOL_MIN: z.coerce.number().min(1).default(2),
  DB_POOL_MAX: z.coerce.number().min(1).default(10),
  DB_POOL_IDLE_TIMEOUT: z.coerce.number().min(1000).default(30000),
  DB_POOL_CONNECTION_TIMEOUT: z.coerce.number().min(1000).default(2000),

  // Authentication & Security
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  SESSION_SECRET: z.string().min(32),
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(15).default(12),

  // CORS & Security
  ALLOWED_ORIGINS: z.string().default('*'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  HELMET_ENABLED: z.coerce.boolean().default(true),
  CSRF_ENABLED: z.coerce.boolean().default(false),

  // Rate Limiting
  RATE_LIMIT_TTL: z.coerce.number().min(1000).default(60000),
  RATE_LIMIT_MAX: z.coerce.number().min(1).default(100),
  RATE_LIMIT_GLOBAL_TTL: z.coerce.number().min(1000).default(3600000),
  RATE_LIMIT_GLOBAL_MAX: z.coerce.number().min(1).default(1000),

  // Email Configuration
  EMAIL_FROM: z.string().email(),
  EMAIL_REPLY_TO: z.string().email().optional(),
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().min(1).max(65535).default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  REQUIRE_EMAIL_VERIFICATION: z.coerce.boolean().default(false),

  // OAuth Providers
  GOOGLE_OAUTH_ENABLED: z.coerce.boolean().default(false),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),

  FACEBOOK_OAUTH_ENABLED: z.coerce.boolean().default(false),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_REDIRECT_URI: z.string().url().optional(),

  GITHUB_OAUTH_ENABLED: z.coerce.boolean().default(false),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_REDIRECT_URI: z.string().url().optional(),

  // Redis Configuration
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().min(1).max(65535).default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().min(0).default(0),
  REDIS_TTL: z.coerce.number().min(1).default(3600),

  // Logging Configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'verbose']).default('info'),
  LOG_FILE_ENABLED: z.coerce.boolean().default(true),
  LOG_FILE_PATH: z.string().default('logs'),
  LOG_MAX_FILES: z.coerce.number().min(1).default(5),
  LOG_MAX_SIZE: z.string().default('10m'),

  // Health Checks & Monitoring
  HEALTH_CHECK_ENABLED: z.coerce.boolean().default(true),
  HEALTH_CHECK_DATABASE: z.coerce.boolean().default(true),
  HEALTH_CHECK_REDIS: z.coerce.boolean().default(true),
  HEALTH_CHECK_MEMORY_HEAP: z.coerce.boolean().default(true),
  HEALTH_CHECK_MEMORY_RSS: z.coerce.boolean().default(true),
  METRICS_ENABLED: z.coerce.boolean().default(true),
  METRICS_PREFIX: z.string().default('nestjs_app'),

  // Queue Configuration
  QUEUE_ENABLED: z.coerce.boolean().default(true),
  QUEUE_MAX_CONNECTIONS: z.coerce.number().min(1).default(10),
  QUEUE_ARCHIVE_COMPLETED_AFTER_SECONDS: z.coerce.number().min(1).default(86400),
  QUEUE_DELETE_AFTER_DAYS: z.coerce.number().min(1).default(7),

  // File Upload & Storage
  UPLOAD_MAX_FILE_SIZE: z.coerce.number().min(1).default(10485760), // 10MB
  UPLOAD_ALLOWED_TYPES: z.string().default('image/jpeg,image/png,image/gif,application/pdf'),
  UPLOAD_DESTINATION: z.string().default('uploads'),
  CLOUD_STORAGE_ENABLED: z.coerce.boolean().default(false),
  CLOUD_STORAGE_PROVIDER: z.enum(['aws', 'gcp', 'azure']).optional(),
  CLOUD_STORAGE_BUCKET: z.string().optional(),
  CLOUD_STORAGE_REGION: z.string().optional(),
  CLOUD_STORAGE_ACCESS_KEY: z.string().optional(),
  CLOUD_STORAGE_SECRET_KEY: z.string().optional(),

  // External Services
  API_KEY: z.string().optional(),
  EXTERNAL_API_BASE_URL: z.string().url().optional(),
  EXTERNAL_API_TIMEOUT: z.coerce.number().min(1000).default(5000),

  // GraphQL Configuration
  GRAPHQL_PLAYGROUND: z.coerce.boolean().default(false),
  GRAPHQL_INTROSPECTION: z.coerce.boolean().default(true),
  GRAPHQL_DEBUG: z.coerce.boolean().default(false),
  GRAPHQL_INCLUDE_STACK_TRACE: z.coerce.boolean().default(false),

  // Development Tools
  SWAGGER_ENABLED: z.coerce.boolean().default(true),
  SWAGGER_PATH: z.string().default('api/docs'),

  // Testing
  TEST_DATABASE_URL: z.string().url().optional(),

  // Production Optimizations
  COMPRESSION_ENABLED: z.coerce.boolean().default(true),
  COMPRESSION_LEVEL: z.coerce.number().min(1).max(9).default(6),
  CACHE_TTL: z.coerce.number().min(1).default(300),
  CACHE_MAX_ITEMS: z.coerce.number().min(1).default(1000),
  KEEP_ALIVE_TIMEOUT: z.coerce.number().min(1000).default(5000),
  HEADERS_TIMEOUT: z.coerce.number().min(1000).default(60000),
});

export type Configuration = z.infer<typeof configurationSchema>;

/**
 * Validate environment variables against the schema
 */
export function validateConfiguration(config: Record<string, unknown>): Configuration {
  try {
    return configurationSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      );
      throw new Error(
        `Configuration validation failed:\n${errorMessages.join('\n')}`
      );
    }
    throw error;
  }
}

/**
 * Get configuration with defaults and validation
 */
export function getConfiguration(): Configuration {
  return validateConfiguration(process.env);
}
