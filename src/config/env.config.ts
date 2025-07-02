import { getConfiguration } from './configuration.schema';

/**
 * Configuration factory function that validates and returns environment configuration
 * This replaces the previous manual configuration with a validated schema-based approach
 */
export default () => {
  const config = getConfiguration();

  return {
    // Application Configuration
    env: config.NODE_ENV,
    port: config.PORT,
    appName: config.APP_NAME,
    appVersion: config.APP_VERSION,

    // Database Configuration
    DATABASE_URL: config.DATABASE_URL,
    database: {
      url: config.DATABASE_URL,
      pool: {
        min: config.DB_POOL_MIN,
        max: config.DB_POOL_MAX,
        idleTimeout: config.DB_POOL_IDLE_TIMEOUT,
        connectionTimeout: config.DB_POOL_CONNECTION_TIMEOUT,
      },
    },

    // Authentication & Security
    JWT_SECRET: config.JWT_SECRET,
    JWT_EXPIRES_IN: config.JWT_EXPIRES_IN,
    JWT_REFRESH_SECRET: config.JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN: config.JWT_REFRESH_EXPIRES_IN,
    SESSION_SECRET: config.SESSION_SECRET,
    BCRYPT_ROUNDS: config.BCRYPT_ROUNDS,

    // CORS & Security
    ALLOWED_ORIGINS: config.ALLOWED_ORIGINS,
    FRONTEND_URL: config.FRONTEND_URL,
    HELMET_ENABLED: config.HELMET_ENABLED,
    CSRF_ENABLED: config.CSRF_ENABLED,

    // Rate Limiting
    rateLimit: {
      ttl: config.RATE_LIMIT_TTL,
      max: config.RATE_LIMIT_MAX,
      globalTtl: config.RATE_LIMIT_GLOBAL_TTL,
      globalMax: config.RATE_LIMIT_GLOBAL_MAX,
    },

    // Email Configuration
    EMAIL_FROM: config.EMAIL_FROM,
    EMAIL_REPLY_TO: config.EMAIL_REPLY_TO,
    email: {
      from: config.EMAIL_FROM,
      replyTo: config.EMAIL_REPLY_TO,
      smtp: {
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: config.SMTP_SECURE,
        auth: {
          user: config.SMTP_USER,
          pass: config.SMTP_PASS,
        },
      },
      requireVerification: config.REQUIRE_EMAIL_VERIFICATION,
    },

    // OAuth Configuration
    GOOGLE_OAUTH_ENABLED: config.GOOGLE_OAUTH_ENABLED,
    GOOGLE_CLIENT_ID: config.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: config.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: config.GOOGLE_REDIRECT_URI,

    FACEBOOK_OAUTH_ENABLED: config.FACEBOOK_OAUTH_ENABLED,
    FACEBOOK_CLIENT_ID: config.FACEBOOK_CLIENT_ID,
    FACEBOOK_CLIENT_SECRET: config.FACEBOOK_CLIENT_SECRET,
    FACEBOOK_REDIRECT_URI: config.FACEBOOK_REDIRECT_URI,

    GITHUB_OAUTH_ENABLED: config.GITHUB_OAUTH_ENABLED,
    GITHUB_CLIENT_ID: config.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: config.GITHUB_CLIENT_SECRET,
    GITHUB_REDIRECT_URI: config.GITHUB_REDIRECT_URI,

    // Redis Configuration
    redis: {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      password: config.REDIS_PASSWORD,
      db: config.REDIS_DB,
      ttl: config.REDIS_TTL,
    },

    // Logging Configuration
    logging: {
      level: config.LOG_LEVEL,
      fileEnabled: config.LOG_FILE_ENABLED,
      filePath: config.LOG_FILE_PATH,
      maxFiles: config.LOG_MAX_FILES,
      maxSize: config.LOG_MAX_SIZE,
    },

    // Health Checks & Monitoring
    healthCheck: {
      enabled: config.HEALTH_CHECK_ENABLED,
      database: config.HEALTH_CHECK_DATABASE,
      redis: config.HEALTH_CHECK_REDIS,
      memoryHeap: config.HEALTH_CHECK_MEMORY_HEAP,
      memoryRss: config.HEALTH_CHECK_MEMORY_RSS,
    },
    metrics: {
      enabled: config.METRICS_ENABLED,
      prefix: config.METRICS_PREFIX,
    },

    // Queue Configuration
    queue: {
      enabled: config.QUEUE_ENABLED,
      maxConnections: config.QUEUE_MAX_CONNECTIONS,
      archiveCompletedAfterSeconds:
        config.QUEUE_ARCHIVE_COMPLETED_AFTER_SECONDS,
      deleteAfterDays: config.QUEUE_DELETE_AFTER_DAYS,
    },

    // File Upload & Storage
    upload: {
      maxFileSize: config.UPLOAD_MAX_FILE_SIZE,
      allowedTypes: config.UPLOAD_ALLOWED_TYPES.split(','),
      destination: config.UPLOAD_DESTINATION,
    },
    cloudStorage: {
      enabled: config.CLOUD_STORAGE_ENABLED,
      provider: config.CLOUD_STORAGE_PROVIDER,
      bucket: config.CLOUD_STORAGE_BUCKET,
      region: config.CLOUD_STORAGE_REGION,
      accessKey: config.CLOUD_STORAGE_ACCESS_KEY,
      secretKey: config.CLOUD_STORAGE_SECRET_KEY,
    },

    // External Services
    API_KEY: config.API_KEY,
    externalApi: {
      baseUrl: config.EXTERNAL_API_BASE_URL,
      timeout: config.EXTERNAL_API_TIMEOUT,
    },

    // GraphQL Configuration
    graphql: {
      playground: config.GRAPHQL_PLAYGROUND,
      introspection: config.GRAPHQL_INTROSPECTION,
      debug: config.GRAPHQL_DEBUG,
      includeStackTrace: config.GRAPHQL_INCLUDE_STACK_TRACE,
    },

    // Development Tools
    swagger: {
      enabled: config.SWAGGER_ENABLED,
      path: config.SWAGGER_PATH,
    },

    // Testing
    TEST_DATABASE_URL: config.TEST_DATABASE_URL,

    // Production Optimizations
    compression: {
      enabled: config.COMPRESSION_ENABLED,
      level: config.COMPRESSION_LEVEL,
    },
    cache: {
      ttl: config.CACHE_TTL,
      maxItems: config.CACHE_MAX_ITEMS,
    },
    server: {
      keepAliveTimeout: config.KEEP_ALIVE_TIMEOUT,
      headersTimeout: config.HEADERS_TIMEOUT,
    },

    // Legacy compatibility (for existing code)
    REQUIRE_EMAIL_VERIFICATION: config.REQUIRE_EMAIL_VERIFICATION,
    SMTP_HOST: config.SMTP_HOST,
    SMTP_PORT: config.SMTP_PORT,
    SMTP_SECURE: config.SMTP_SECURE,
    SMTP_USER: config.SMTP_USER,
    SMTP_PASS: config.SMTP_PASS,
  };
};
