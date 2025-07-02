export default () => ({
  env: process.env.NODE_ENV ?? 'development',
  DATABASE_URL:
    process.env.DATABASE_URL ??
    'postgresql://postgres:password@localhost:5432/nestjs_graphql_db',

  // Better Auth Configuration
  JWT_SECRET: process.env.JWT_SECRET ?? 'your-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',

  // Email Configuration for Better Auth
  EMAIL_FROM: process.env.EMAIL_FROM ?? 'noreply@example.com',
  SMTP_HOST: process.env.SMTP_HOST ?? 'localhost',
  SMTP_PORT: parseInt(process.env.SMTP_PORT ?? '587', 10),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER ?? '',
  SMTP_PASS: process.env.SMTP_PASS ?? '',

  // OAuth Configuration
  GOOGLE_OAUTH_ENABLED: process.env.GOOGLE_OAUTH_ENABLED === 'true',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? '',

  FACEBOOK_OAUTH_ENABLED: process.env.FACEBOOK_OAUTH_ENABLED === 'true',
  FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID ?? '',
  FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET ?? '',

  // Frontend URL for OAuth redirects
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:3000',

  // Email verification
  REQUIRE_EMAIL_VERIFICATION: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
});
