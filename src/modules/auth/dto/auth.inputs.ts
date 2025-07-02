import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
  IsStrongPassword,
  Transform,
  IsUUID,
} from 'class-validator';
import { Transform as TransformDecorator } from 'class-transformer';

@InputType()
export class LoginInput {
  @Field({ description: 'User email address' })
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  @TransformDecorator(({ value }) => value?.toLowerCase()?.trim())
  email: string;

  @Field({ description: 'User password' })
  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123!',
    minLength: 6,
    maxLength: 128,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  password: string;
}

@InputType()
export class RegisterInput {
  @Field({ description: 'User email address' })
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  @TransformDecorator(({ value }) => value?.toLowerCase()?.trim())
  email: string;

  @Field({ description: 'User password' })
  @ApiProperty({
    description:
      'Strong password with at least 8 characters, including uppercase, lowercase, number, and special character',
    example: 'SecurePassword123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsString({ message: 'Password must be a string' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must contain at least 8 characters with uppercase, lowercase, number, and special character',
    },
  )
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  password: string;

  @Field({ description: 'User full name' })
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  })
  @TransformDecorator(({ value }) => value?.trim())
  name: string;
}

@InputType()
export class RequestPasswordResetInput {
  @Field({ description: 'Email address to send password reset link' })
  @ApiProperty({
    description: 'Email address to send password reset link',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  @TransformDecorator(({ value }) => value?.toLowerCase()?.trim())
  email: string;
}

@InputType()
export class ResetPasswordInput {
  @Field({ description: 'Password reset token' })
  @ApiProperty({
    description: 'Password reset token received via email',
    example: 'abc123def456ghi789',
  })
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token is required' })
  @MinLength(10, { message: 'Invalid token format' })
  @MaxLength(500, { message: 'Invalid token format' })
  token: string;

  @Field({ description: 'New password' })
  @ApiProperty({
    description:
      'New strong password with at least 8 characters, including uppercase, lowercase, number, and special character',
    example: 'NewSecurePassword123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsString({ message: 'Password must be a string' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must contain at least 8 characters with uppercase, lowercase, number, and special character',
    },
  )
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  newPassword: string;
}

@InputType()
export class ChangePasswordInput {
  @Field({ description: 'Current password' })
  @ApiProperty({
    description: 'Current password for verification',
    example: 'CurrentPassword123!',
  })
  @IsString({ message: 'Current password must be a string' })
  @IsNotEmpty({ message: 'Current password is required' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  currentPassword: string;

  @Field({ description: 'New password' })
  @ApiProperty({
    description:
      'New strong password with at least 8 characters, including uppercase, lowercase, number, and special character',
    example: 'NewSecurePassword123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsString({ message: 'New password must be a string' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'New password must contain at least 8 characters with uppercase, lowercase, number, and special character',
    },
  )
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  newPassword: string;
}

@InputType()
export class OAuthLoginInput {
  @Field({ description: 'OAuth provider name' })
  @ApiProperty({
    description: 'OAuth provider name',
    example: 'google',
    enum: ['google', 'facebook', 'github'],
  })
  @IsString({ message: 'Provider must be a string' })
  @IsNotEmpty({ message: 'Provider is required' })
  @Matches(/^(google|facebook|github)$/, {
    message: 'Provider must be one of: google, facebook, github',
  })
  provider: string;

  @Field({ description: 'OAuth authorization code' })
  @ApiProperty({
    description: 'OAuth authorization code received from provider',
    example: 'abc123def456ghi789',
  })
  @IsString({ message: 'Code must be a string' })
  @IsNotEmpty({ message: 'Authorization code is required' })
  @MinLength(10, { message: 'Invalid authorization code format' })
  @MaxLength(1000, { message: 'Invalid authorization code format' })
  code: string;
}

@InputType()
export class RefreshTokenInput {
  @Field({ description: 'Refresh token' })
  @ApiProperty({
    description: 'Refresh token for obtaining new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: 'Refresh token must be a string' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  @MinLength(10, { message: 'Invalid refresh token format' })
  @MaxLength(1000, { message: 'Invalid refresh token format' })
  refreshToken: string;
}
