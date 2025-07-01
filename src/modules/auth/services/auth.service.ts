import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import {
  User as DbUser,
  UserRole,
} from '../../../infra/database/schemas/users.schema';
import { JwtPayload } from '../../../infra/jwt/strategies/jwt.strategy';
import { LoginInput, RegisterInput } from '../dto/auth.inputs';
import { AuthPayload } from '../dto/auth.outputs';
import { User as GqlUser } from '../models/user.model';

import { UserService } from './user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerInput: RegisterInput): Promise<AuthPayload> {
    const existingUser = await this.userService.findByEmail(
      registerInput.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerInput.password, 10);

    const user = await this.userService.create({
      email: registerInput.email,
      name: registerInput.name,
      password: hashedPassword,
      role: UserRole.USER,
    });

    const token = this.generateToken(user);

    return {
      token,
      user: this.mapDbUserToGqlUser(user),
    };
  }

  async login(loginInput: LoginInput): Promise<AuthPayload> {
    const user = await this.userService.findByEmail(loginInput.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginInput.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const token = this.generateToken(user);

    return {
      token,
      user: this.mapDbUserToGqlUser(user),
    };
  }

  async validateUser(payload: JwtPayload): Promise<GqlUser | null> {
    const user = await this.userService.findById(payload.sub);
    if (!user || !user.isActive) {
      return null;
    }
    return this.mapDbUserToGqlUser(user);
  }

  private generateToken(user: DbUser): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  private mapDbUserToGqlUser(user: DbUser): GqlUser {
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
}
