import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

import { AppLoggerService } from '../../core/logger/logger.service';
import { DatabaseService } from '../../infra/database/database.service';
import {
  NewUser,
  User,
  users,
  UserRole,
} from '../../infra/database/schemas/users.schema';

import { RegisterInput } from './dto/user.input';
import { UserModel } from './models/user.model';

function toUserModel(user: User): UserModel {
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
  ) { }

  async findById(id: string): Promise<User | null> {
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

  async createUser(input: RegisterInput): Promise<UserModel> {
    const existingUser = await this.findByEmail(input.email);
    if (existingUser) {
      this.logger.warn(
        `Attempted to create user with existing email: ${input.email}`,
      );
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await this.create({
      email: input.email,
      name: input.name,
      password: hashedPassword,
      role: UserRole.USER,
    });

    this.logger.log(`User created successfully: ${user.id}`);
    return this.getUserById(user.id);
  }

  private async create(userData: NewUser): Promise<User> {
    const [user] = await this.db.drizzle
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async update(id: string, userData: Partial<NewUser>): Promise<User> {
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

  async delete(id: string): Promise<boolean> {
    const result = await this.db.drizzle.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async findAll(): Promise<User[]> {
    return await this.db.drizzle.select().from(users);
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
    const usersList = await this.db.drizzle.query.users.findMany({
      limit,
      offset,
      orderBy: (u, { desc }) => [desc(u.createdAt)],
    });
    return usersList.map(toUserModel);
  }

  async updateUser(
    id: string,
    data: { name?: string; isActive?: boolean },
  ): Promise<UserModel> {
    await this.getUserById(id);
    const updated = await this.db.drizzle
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    this.logger.log(`User updated: ${id}`);
    return toUserModel(updated[0]);
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.getUserById(id);
    await this.db.drizzle.delete(users).where(eq(users.id, id));
    this.logger.log(`User deleted: ${id}`);
    return true;
  }
}
