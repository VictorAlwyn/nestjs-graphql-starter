import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import PgBoss from 'pg-boss';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'PG_BOSS',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const databaseUrl = configService.getOrThrow<string>('DATABASE_URL');
        const boss = new PgBoss({ connectionString: databaseUrl });
        await boss.start();
        return boss;
      },
    },
  ],
  exports: ['PG_BOSS'],
})
export class PgBossModule {}
