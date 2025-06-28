import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DRIZZLE } from './constants';
import * as schema from './schemas';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.getOrThrow<string>('DATABASE_URL');

        const pool = new Pool({ connectionString: databaseUrl });
        const db = drizzle(pool, { schema });
        return db;
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
