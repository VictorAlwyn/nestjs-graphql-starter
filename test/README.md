# Testing Guide

This document provides comprehensive information about the testing setup for the NestJS GraphQL application.

## 🧪 Test Structure

```
test/
├── setup/
│   └── test-setup.ts          # Test utilities and configuration
├── unit/                      # Unit tests
│   └── auth.service.spec.ts   # Service unit tests
├── graphql/                   # GraphQL integration tests
│   ├── auth.e2e-spec.ts       # Authentication tests
│   └── recipes.e2e-spec.ts    # Recipes tests
├── rest/                      # REST API tests
│   └── health.e2e-spec.ts     # Health endpoint tests
├── email/                     # Email service tests
│   └── email.service.spec.ts  # Email service unit tests
├── app.e2e-spec.ts            # Main application tests
├── jest-e2e.json             # E2E test configuration
└── README.md                 # This file
```

## 🚀 Quick Start

### 1. Setup Test Environment

```bash
# Start test containers (PostgreSQL + Redis)
npm run test:setup

# Or use the setup script
./scripts/setup-test-db.sh
```

### 2. Run Tests

```bash
# Run all tests (unit + integration + e2e)
npm run test:all

# Run specific test types
npm run test:unit          # Unit tests only
npm run test:integration   # GraphQL + REST tests
npm run test:e2e          # End-to-end tests

# Run with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

### 3. Full Test Suite

```bash
# Complete test workflow (setup → run → teardown)
npm run test:full
```

## 📋 Test Types

### Unit Tests (`test/unit/`)

- **Purpose**: Test individual functions and services in isolation
- **Scope**: Single service/function testing with mocked dependencies
- **Speed**: Fast execution
- **Example**: `auth.service.spec.ts`

### Integration Tests (`test/graphql/`, `test/rest/`)

- **Purpose**: Test API endpoints and GraphQL operations
- **Scope**: Full request/response cycle with real database
- **Speed**: Medium execution
- **Examples**:
  - `auth.e2e-spec.ts` - Authentication flows
  - `recipes.e2e-spec.ts` - Recipe CRUD operations
  - `health.e2e-spec.ts` - Health check endpoints

### End-to-End Tests (`test/app.e2e-spec.ts`)

- **Purpose**: Test complete application workflows
- **Scope**: Full application with all dependencies
- **Speed**: Slower execution
- **Example**: Complete user registration and authentication flow

## 🗄️ Test Database

### Configuration

- **Database**: PostgreSQL (port 5433)
- **Redis**: Redis (port 6380)
- **Connection**: `postgresql://postgres:postgres@localhost:5433/test_db`

### Setup

The test database is automatically:

1. Started via Docker Compose
2. Migrated with latest schema
3. Cleaned between test runs

### Environment Variables

Test-specific environment variables are loaded from `.env.test`:

```env
NODE_ENV=test
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/test_db
REDIS_URL=redis://localhost:6380
JWT_SECRET=test-jwt-secret-key-for-testing-only
```

## 🛠️ Test Utilities

### Test Setup (`test/setup/test-setup.ts`)

#### `createTestingApp()`

Creates a fully configured test application with:

- Database connection
- GraphQL setup
- Authentication guards
- Validation pipes

#### `closeTestingApp(testApp)`

Properly closes the test application and cleans up resources.

#### GraphQL Utilities

```typescript
// Pre-defined GraphQL queries and mutations
LOGIN_MUTATION
REGISTER_MUTATION
ME_QUERY
RECIPES_QUERY
ADD_RECIPE_MUTATION

// GraphQL helper function
gql`query { ... }`

// Header utilities
createGraphQLHeaders(token?)
createAuthHeaders(token)
```

## 📝 Writing Tests

### Unit Test Example

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/modules/auth/auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockBetterAuthService: jest.Mocked<BetterAuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: BetterAuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            // ... other methods
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    mockBetterAuthService = module.get(BetterAuthService);
  });

  it('should register a new user successfully', async () => {
    const input = {
      email: 'test@example.com',
      password: 'password',
      name: 'Test',
    };
    const expectedResult = { token: 'jwt-token', user: { id: '1', ...input } };

    mockBetterAuthService.register.mockResolvedValue(expectedResult);

    const result = await service.register(input);

    expect(result).toEqual(expectedResult);
    expect(mockBetterAuthService.register).toHaveBeenCalledWith(input);
  });
});
```

### Integration Test Example

```typescript
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestingApp,
  closeTestingApp,
  TestApp,
  LOGIN_MUTATION,
} from '../setup/test-setup';

describe('GraphQL Auth (e2e)', () => {
  let testApp: TestApp;
  let app: INestApplication;

  beforeAll(async () => {
    testApp = await createTestingApp();
    app = testApp.app;
  });

  afterAll(async () => {
    await closeTestingApp(testApp);
  });

  it('should login user successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: LOGIN_MUTATION,
        variables: {
          input: { email: 'test@example.com', password: 'password' },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.data.login).toBeDefined();
    expect(response.body.data.login.token).toBeDefined();
  });
});
```

## 🔧 Test Configuration

### Jest Configuration

- **Unit Tests**: Uses default Jest configuration from `package.json`
- **E2E Tests**: Uses `test/jest-e2e.json` configuration
- **Coverage**: Generated in `coverage/` directory

### Docker Compose

- **File**: `docker-compose.test.yml`
- **Services**: PostgreSQL and Redis for testing
- **Ports**: 5433 (PostgreSQL), 6380 (Redis)
- **Volumes**: Isolated test data volumes

## 🚨 Common Issues

### Database Connection Issues

```bash
# Check if test containers are running
docker ps | grep test

# Restart test containers
npm run test:teardown
npm run test:setup
```

### Port Conflicts

If you get port conflicts, ensure:

- Development database is not using port 5433
- Development Redis is not using port 6380
- No other services are using these ports

### Test Failures

1. **Database Issues**: Run `npm run test:setup` to reset test database
2. **Authentication Issues**: Check JWT configuration in `.env.test`
3. **Timeout Issues**: Increase Jest timeout in test configuration

## 📊 Test Coverage

Run coverage report:

```bash
npm run test:cov
```

Coverage reports are generated in:

- `coverage/lcov-report/index.html` - HTML report
- `coverage/lcov.info` - LCOV format for CI/CD

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:alpine
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5433:5432
      redis:
        image: redis:alpine
        ports:
          - 6380:6379
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:all
```

## 📚 Best Practices

1. **Test Isolation**: Each test should be independent
2. **Mock External Dependencies**: Use mocks for external services
3. **Test Data**: Use factories or fixtures for consistent test data
4. **Assertions**: Be specific about what you're testing
5. **Cleanup**: Always clean up after tests
6. **Naming**: Use descriptive test names that explain the scenario
7. **Coverage**: Aim for high test coverage, especially for critical paths

## 🆘 Getting Help

- Check the test logs for detailed error messages
- Ensure all dependencies are installed: `npm install`
- Verify Docker is running and accessible
- Check that test environment variables are properly set
