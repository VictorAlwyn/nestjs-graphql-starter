import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { DRIZZLE } from './constants';
import * as schema from './schemas';

@Injectable()
export class DatabaseService {
  constructor(@Inject(DRIZZLE) public drizzle: NodePgDatabase<typeof schema>) {}

  async isConnected(): Promise<boolean> {
    try {
      // Simple query to test database connection
      await this.drizzle.execute(sql`SELECT 1`);
      return true;
    } catch {
      return false;
    }
  }
}
