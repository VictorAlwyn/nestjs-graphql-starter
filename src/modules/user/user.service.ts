import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { AppLoggerService } from '../../core/logger/logger.service';
import { DatabaseService } from '../../infra/database/database.service';
import {
  NewBetterAuthUser,
  BetterAuthUser,
  betterAuthUsers,
  UserRole,
} from '../../infra/database/schemas/better-auth.schema';

import { UserModel } from './models/user.model';

function toUserModel(user: BetterAuthUser): UserModel {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

@Injectable()
export class UserService {
  constructor(
    private readonly db: DatabaseService,
    private readonly logger: AppLoggerService,
  ) {}

  async findById(id: string): Promise<BetterAuthUser | null> {
    const [user] = await this.db.drizzle
      .select()
      .from(betterAuthUsers)
      .where(eq(betterAuthUsers.id, id));
    return user || null;
  }

  async findByEmail(email: string): Promise<BetterAuthUser | null> {
    const [user] = await this.db.drizzle
      .select()
      .from(betterAuthUsers)
      .where(eq(betterAuthUsers.email, email));
    return user || null;
  }

  async update(
    id: string,
    userData: Partial<NewBetterAuthUser>,
  ): Promise<BetterAuthUser> {
    const [updatedUser] = await this.db.drizzle
      .update(betterAuthUsers)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(betterAuthUsers.id, id))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.drizzle
      .delete(betterAuthUsers)
      .where(eq(betterAuthUsers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async findAll(): Promise<BetterAuthUser[]> {
    return await this.db.drizzle.select().from(betterAuthUsers);
  }

  async getUserById(id: string): Promise<UserModel> {
    const user = await this.findById(id);
    if (!user) {
      this.logger.warn(`User not found: ${id}`);
      throw new NotFoundException('User not found');
    }
    return toUserModel(user);
  }

  async getUsers(limit = 20, offset = 0): Promise<UserModel[]> {
    const usersList = await this.db.drizzle
      .select()
      .from(betterAuthUsers)
      .limit(limit)
      .offset(offset)
      .orderBy(betterAuthUsers.createdAt);
    return usersList.map(toUserModel);
  }

  async updateUser(
    id: string,
    data: { name?: string; isActive?: boolean },
  ): Promise<UserModel> {
    await this.getUserById(id);
    const updated = await this.db.drizzle
      .update(betterAuthUsers)
      .set(data)
      .where(eq(betterAuthUsers.id, id))
      .returning();
    this.logger.log(`User updated: ${id}`);
    return toUserModel(updated[0]);
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.getUserById(id);
    await this.db.drizzle
      .delete(betterAuthUsers)
      .where(eq(betterAuthUsers.id, id));
    this.logger.log(`User deleted: ${id}`);
    return true;
  }
}
