// Jest setup file for handling React components in tests

// Mock @react-email/render
jest.mock('@react-email/render', () => ({
  render: jest.fn((component) => {
    // Simple mock that returns a string representation
    return Promise.resolve(`<html>${JSON.stringify(component)}</html>`);
  }),
}));

// Mock BetterAuthService OAuth for tests
const {
  BetterAuthService,
} = require('../../src/infra/better-auth/better-auth.service');
if (BetterAuthService && BetterAuthService.prototype) {
  jest
    .spyOn(BetterAuthService.prototype, 'loginWithOAuth')
    .mockImplementation(async (provider, code, req) => {
      return {
        token: 'test-token',
        user: { id: 'test-user', email: 'test@example.com', name: 'Test User' },
      };
    });
}

// Global test setup
beforeAll(() => {
  // Set up any global test configuration
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  // Clean up any global test configuration
});

// Suppress console warnings during tests
const originalWarn = console.warn;
const originalError = console.error;

beforeEach(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  console.warn = originalWarn;
  console.error = originalError;
});
