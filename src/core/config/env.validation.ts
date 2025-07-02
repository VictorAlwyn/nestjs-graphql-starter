import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.string().regex(/^\d+$/).default('3000'),
  DB_HOST: z.string(),
  DB_PORT: z.string().regex(/^\d+$/),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_SCHEMA: z.string().optional(),
  JWT_SECRET: z.string(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  EMAIL_REPLY_TO: z.string().optional(),
  FRONTEND_URL: z.string().optional(),
});

export function validateEnv(env: Record<string, unknown>) {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const errorMessage = `❌ Invalid environment variables: ${JSON.stringify(parsed.error.format(), null, 2)}`;
    throw new Error(errorMessage);
  }
  return parsed.data;
}
