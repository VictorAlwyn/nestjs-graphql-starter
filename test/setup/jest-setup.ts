// Jest setup file for handling React components in tests

import { jest } from '@jest/globals';

import type { ReactNode } from 'react';

// Mock React Email components
jest.mock('@react-email/components', () => ({
  Html: ({ children }: { children: ReactNode }) => `<html>${children}</html>`,
  Head: ({ children }: { children: ReactNode }) => `<head>${children}</head>`,
  Preview: ({ children }: { children: ReactNode }) =>
    `<preview>${children}</preview>`,
  Body: ({ children }: { children: ReactNode }) => `<body>${children}</body>`,
  Section: ({ children }: { children: ReactNode }) =>
    `<section>${children}</section>`,
  Container: ({ children }: { children: ReactNode }) =>
    `<container>${children}</container>`,
  Heading: ({ children }: { children: ReactNode }) => `<h1>${children}</h1>`,
  Text: ({ children }: { children: ReactNode }) => `<p>${children}</p>`,
  Link: ({ href, children }: { href: string; children: ReactNode }) =>
    `<a href="${href}">${children}</a>`,
  Button: ({ href, children }: { href: string; children: ReactNode }) =>
    `<button href="${href}">${children}</button>`,
  Hr: () => '<hr />',
  Img: ({ src, alt }: { src: string; alt: string }) =>
    `<img src="${src}" alt="${alt}" />`,
}));

// Mock OAuth providers
jest.mock('@auth/core/providers/google', () => ({
  Google: jest.fn().mockImplementation(() => ({
    id: 'google',
    name: 'Google',
    type: 'oauth',
    authorization: 'https://accounts.google.com/o/oauth2/v2/auth',
    token: 'https://oauth2.googleapis.com/token',
    userinfo: 'https://www.googleapis.com/oauth2/v2/userinfo',
    profile: jest.fn().mockImplementation((_profile: unknown) => ({
      id: 'google_user_id',
      name: 'Test User',
      email: 'test@example.com',
      image: 'https://example.com/avatar.jpg',
    })),
  })),
}));

jest.mock('@auth/core/providers/github', () => ({
  GitHub: jest.fn().mockImplementation(() => ({
    id: 'github',
    name: 'GitHub',
    type: 'oauth',
    authorization: 'https://github.com/login/oauth/authorize',
    token: 'https://github.com/login/oauth/access_token',
    userinfo: 'https://api.github.com/user',
    profile: jest.fn().mockImplementation((_profile: unknown) => ({
      id: 'github_user_id',
      name: 'Test User',
      email: 'test@example.com',
      image: 'https://example.com/avatar.jpg',
    })),
  })),
}));

// Mock email service
jest.mock('../../src/modules/email/email.service', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    sendEmail: jest.fn(),
    sendWelcomeEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    sendVerificationEmail: jest.fn(),
  })),
}));

// Mock Redis
jest.mock('ioredis', () => {
  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    expire: jest.fn(),
    exists: jest.fn(),
    quit: jest.fn(),
  };

  return jest.fn().mockImplementation(() => mockRedis);
});

// Mock database
jest.mock('../../src/infra/database/database.service', () => ({
  DatabaseService: jest.fn().mockImplementation(() => ({
    drizzle: {
      query: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      transaction: jest.fn(),
    },
    onModuleDestroy: jest.fn(),
  })),
}));

// Global test setup
beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
  process.env.REDIS_URL = 'redis://localhost:6380';
  process.env.SMTP_HOST = 'localhost';
  process.env.SMTP_PORT = '1025';
  process.env.SMTP_USER = 'test';
  process.env.SMTP_PASS = 'test';
  process.env.FROM_EMAIL = 'test@example.com';
  process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
  process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
  process.env.GITHUB_CLIENT_ID = 'test-github-client-id';
  process.env.GITHUB_CLIENT_SECRET = 'test-github-client-secret';
  process.env.NEXTAUTH_SECRET = 'test-nextauth-secret';
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
});

// Global test teardown
afterAll(() => {
  // Clean up environment variables
  delete process.env.NODE_ENV;
  delete process.env.JWT_SECRET;
  delete process.env.DATABASE_URL;
  delete process.env.REDIS_URL;
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_PORT;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
  delete process.env.FROM_EMAIL;
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;
  delete process.env.GITHUB_CLIENT_ID;
  delete process.env.GITHUB_CLIENT_SECRET;
  delete process.env.NEXTAUTH_SECRET;
  delete process.env.NEXTAUTH_URL;
});

// Suppress console logs during tests
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeEach(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});
