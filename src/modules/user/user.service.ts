import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { AppLoggerService } from '../../core/logger/logger.service';
import { DatabaseService } from '../../infra/database/database.service';
import { users } from '../../infra/database/schemas/users.schema';

function toUserModel(user: any) {
  return {
    ...user,
    id: String(user.id),
  };
}

@Injectable()
export class UserService {
  constructor(
    private readonly db: DatabaseService,
    private readonly logger: AppLoggerService,
  ) {}

  async getUserById(id: string) {
    const numId = Number(id);
    const user = await this.db.drizzle.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, numId),
    });
    if (!user) {
      this.logger.warn(`User not found: ${id}`);
      throw new NotFoundException('User not found');
    }
    return toUserModel(user);
  }

  async getUsers(limit = 20, offset = 0) {
    const usersList = await this.db.drizzle.query.users.findMany({
      limit,
      offset,
      orderBy: (u, { desc }) => [desc(u.createdAt)],
    });
    return usersList.map(toUserModel);
  }

  async updateUser(id: string, data: { name?: string; isActive?: boolean }) {
    const numId = Number(id);
    await this.getUserById(id);
    const updated = await this.db.drizzle
      .update(users)
      .set(data)
      .where(eq(users.id, numId))
      .returning();
    this.logger.log(`User updated: ${id}`);
    return toUserModel(updated[0]);
  }

  async deleteUser(id: string) {
    const numId = Number(id);
    await this.getUserById(id);
    await this.db.drizzle.delete(users).where(eq(users.id, numId));
    this.logger.log(`User deleted: ${id}`);
    return true;
  }
}
