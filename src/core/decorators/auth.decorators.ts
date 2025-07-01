import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';

import { UserRole } from '../../infra/database/schemas/users.schema';
import { JwtAuthGuard } from '../../infra/jwt/guards/jwt-auth.guard';
import { RolesGuard } from '../../infra/jwt/guards/roles.guard';

export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

/**
 * Mark a route as public (no authentication required)
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Require specific roles for access
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Apply JWT authentication guard
 */
export const Auth = () => UseGuards(JwtAuthGuard);

/**
 * Apply both authentication and role-based authorization
 */
export const AuthRoles = (...roles: UserRole[]) =>
  applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles(...roles));

/**
 * Admin only access
 */
export const AdminOnly = () => AuthRoles(UserRole.ADMIN);

/**
 * Moderator and Admin access
 */
export const ModeratorOrAdmin = () =>
  AuthRoles(UserRole.MODERATOR, UserRole.ADMIN);
