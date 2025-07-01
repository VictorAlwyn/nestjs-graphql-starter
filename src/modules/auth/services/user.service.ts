import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DatabaseService } from '../../../infra/database/database.service';
import {
  NewUser,
  User,
  users,
} from '../../../infra/database/schemas/users.schema';

@Injectable()
export class UserService {
  constructor(private readonly db: DatabaseService) {}

  async findById(id: number): Promise<User | null> {
    const [user] = await this.db.drizzle
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.db.drizzle
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user || null;
  }

  async create(userData: NewUser): Promise<User> {
    const [user] = await this.db.drizzle
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async update(id: number, userData: Partial<NewUser>): Promise<User> {
    const [updatedUser] = await this.db.drizzle
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return updatedUser;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.drizzle.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async findAll(): Promise<User[]> {
    return await this.db.drizzle.select().from(users);
  }
}
