import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

import { UserRole } from '../../../infra/database/schemas/better-auth.schema';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true, description: 'User full name' })
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    required: false,
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @Field({ nullable: true, description: 'User active status' })
  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}

@InputType()
export class CreateUserInput {
  @Field({ description: 'User email address' })
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsString({ message: 'Email must be a string' })
  @MinLength(5, { message: 'Email must be at least 5 characters long' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
    message: 'Please provide a valid email address',
  })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email: string;

  @Field({ description: 'User full name' })
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  })
  @Transform(({ value }) => value?.trim())
  name: string;

  @Field(() => UserRole, { nullable: true, description: 'User role' })
  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.USER,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  role?: UserRole;

  @Field({ nullable: true, description: 'User active status' })
  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}

@InputType()
export class UserFilterInput {
  @Field({ nullable: true, description: 'Filter by user role' })
  @ApiProperty({
    description: 'Filter users by role',
    enum: UserRole,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  role?: UserRole;

  @Field({ nullable: true, description: 'Filter by active status' })
  @ApiProperty({
    description: 'Filter users by active status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;

  @Field({ nullable: true, description: 'Search by name or email' })
  @ApiProperty({
    description: 'Search users by name or email',
    example: 'john',
    required: false,
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  @MinLength(2, { message: 'Search term must be at least 2 characters long' })
  @MaxLength(100, { message: 'Search term must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  search?: string;
}

@InputType()
export class UserIdInput {
  @Field({ description: 'User ID' })
  @ApiProperty({
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID(4, { message: 'ID must be a valid UUID' })
  id: string;
}
