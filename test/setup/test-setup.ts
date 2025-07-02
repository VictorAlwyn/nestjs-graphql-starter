import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../../src/app.module';
import { DatabaseService } from '../../src/infra/database/database.service';
import {
  betterAuthSessions,
  betterAuthUsers,
  betterAuthAuditLogs,
} from '../../src/infra/database/schemas/better-auth.schema';

export interface TestApp {
  app: INestApplication;
  module: TestingModule;
}

export async function createTestingApp(): Promise<TestApp> {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = TEST_DATABASE_URL;
  process.env.REDIS_URL = TEST_REDIS_URL;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
      }),
      AppModule,
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Configure GraphQL
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  return { app, module: moduleFixture };
}

export async function closeTestingApp(testApp: TestApp): Promise<void> {
  await testApp.app.close();
}

// Database cleanup utility
export async function cleanupTestDatabase(
  app: INestApplication,
): Promise<void> {
  try {
    const databaseService = app.get(DatabaseService);
    const drizzle = databaseService.drizzle;

    // Clean up test data
    await drizzle.delete(betterAuthSessions);
    await drizzle.delete(betterAuthUsers);
    await drizzle.delete(betterAuthAuditLogs);
  } catch (error) {
    // Log warning but don't fail the test
    if (error instanceof Error) {
      console.warn('Failed to cleanup test database:', error.message);
    }
  }
}

// Test database configuration
export const TEST_DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5432/test_db';
export const TEST_REDIS_URL = 'redis://localhost:6380';

// Test user data
export const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  name: 'Test User',
};

export const TEST_ADMIN_USER = {
  email: 'admin@example.com',
  password: 'AdminPassword123!',
  name: 'Admin User',
};

// GraphQL test utilities
export const gql = (
  strings: TemplateStringsArray,
  ...args: (string | number)[]
): string => {
  return strings.reduce((result, string, index) => {
    return result + string + (args[index]?.toString() || '');
  }, '');
};

// Common GraphQL queries and mutations
export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        name
        role
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        name
        role
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      role
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const USERS_QUERY = gql`
  query Users {
    users {
      id
      email
      name
      role
      isActive
      createdAt
      updatedAt
    }
  }
`;

// REST API test utilities
export const REST_ENDPOINTS = {
  HEALTH: '/health',
  OAUTH_CALLBACK: '/auth/oauth/:provider/callback',
} as const;

// Test helpers
export function createAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export function createGraphQLHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}
