import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/infra/database/schemas/*.schema.ts',
  out: './src/infra/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://postgres:postgres@localhost:5432/test_db',
  },
  verbose: true,
  strict: true,
});
