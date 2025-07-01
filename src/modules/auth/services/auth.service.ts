import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import {
  User as DbUser,
  UserRole,
} from '../../../infra/database/schemas/users.schema';
import { JwtPayload } from '../../../infra/jwt/strategies/jwt.strategy';
import { UserModel } from '../../user/models/user.model';
import { UserService } from '../../user/user.service';
import { LoginInput } from '../dto/auth.inputs';
import { AuthPayload } from '../dto/auth.outputs';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }

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

  async validateUser(payload: JwtPayload): Promise<UserModel | null> {
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

  private mapDbUserToGqlUser(user: DbUser): UserModel {
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
