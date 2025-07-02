import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import {
  createTestingApp,
  closeTestingApp,
  cleanupTestDatabase,
  TestApp,
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  ME_QUERY,
  createGraphQLHeaders,
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

  beforeEach(async () => {
    // Clean up database before each test
    await cleanupTestDatabase(app);
  });

  describe('Authentication', () => {
    describe('Register', () => {
      it('should register a new user successfully', async () => {
        const registerInput = {
          email: 'newuser@example.com',
          password: 'NewUserPassword123!',
          name: 'New User',
        };

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .set(createGraphQLHeaders())
          .send({
            query: REGISTER_MUTATION,
            variables: { input: registerInput },
          });

        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.register).toBeDefined();
        expect(response.body.data.register.token).toBeDefined();
        expect(response.body.data.register.user).toBeDefined();
        expect(response.body.data.register.user.email).toBe(
          registerInput.email,
        );
        expect(response.body.data.register.user.name).toBe(registerInput.name);
        expect(response.body.data.register.user.role).toBe('USER');
        expect(response.body.data.register.user.isActive).toBe(true);
      });

      it('should fail to register with invalid email', async () => {
        const registerInput = {
          email: 'invalid-email',
          password: 'ValidPassword123!',
          name: 'Test User',
        };

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .set(createGraphQLHeaders())
          .send({
            query: REGISTER_MUTATION,
            variables: { input: registerInput },
          });

        expect(response.status).toBe(200);
        expect(response.body.errors).toBeDefined();
        // Check for validation error or generic error message
        const errorMessage = response.body.errors[0].message;
        expect(
          errorMessage.includes('email') ||
            errorMessage.includes('Bad Request Exception') ||
            errorMessage.includes('Validation failed'),
        ).toBe(true);
      });

      it('should fail to register with weak password', async () => {
        const registerInput = {
          email: 'test@example.com',
          password: 'weak',
          name: 'Test User',
        };

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .set(createGraphQLHeaders())
          .send({
            query: REGISTER_MUTATION,
            variables: { input: registerInput },
          });

        expect(response.status).toBe(200);
        expect(response.body.errors).toBeDefined();
      });

      it('should fail to register with duplicate email', async () => {
        // First registration
        const registerInput = {
          email: 'duplicate@example.com',
          password: 'ValidPassword123!',
          name: 'First User',
        };

        await request(app.getHttpServer())
          .post('/graphql')
          .set(createGraphQLHeaders())
          .send({
            query: REGISTER_MUTATION,
            variables: { input: registerInput },
          });

        // Second registration with same email
        const response = await request(app.getHttpServer())
          .post('/graphql')
          .set(createGraphQLHeaders())
          .send({
            query: REGISTER_MUTATION,
            variables: { input: registerInput },
          });

        expect(response.status).toBe(200);
        expect(response.body.errors).toBeDefined();
        // Check for duplicate email error or generic error message
        const errorMessage = response.body.errors[0].message;
        expect(
          errorMessage.includes('email') ||
            errorMessage.includes('Registration failed') ||
            errorMessage.includes('already exists'),
        ).toBe(true);
      });
    });

    describe('Login', () => {
      it('should login successfully with valid credentials', async () => {
        // First register a user
        const registerInput = {
          email: 'loginuser@example.com',
          password: 'LoginPassword123!',
          name: 'Login User',
        };

        await request(app.getHttpServer())
          .post('/graphql')
          .set(createGraphQLHeaders())
          .send({
            query: REGISTER_MUTATION,
            variables: { input: registerInput },
          });

        // Then login
        const loginInput = {
          email: registerInput.email,
          password: registerInput.password,
        };

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .set(createGraphQLHeaders())
          .send({
            query: LOGIN_MUTATION,
            variables: { input: loginInput },
          });

        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.login).toBeDefined();
        expect(response.body.data.login.token).toBeDefined();
        expect(response.body.data.login.user).toBeDefined();
        expect(response.body.data.login.user.email).toBe(loginInput.email);
      });

      it('should fail to login with invalid email', async () => {
        const loginInput = {
          email: 'nonexistent@example.com',
          password: 'ValidPassword123!',
        };

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .set(createGraphQLHeaders())
          .send({
            query: LOGIN_MUTATION,
            variables: { input: loginInput },
          });

        expect(response.status).toBe(200);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe('Invalid credentials');
      });

      it('should fail to login with wrong password', async () => {
        // First register a user
        const registerInput = {
          email: 'wrongpass@example.com',
          password: 'CorrectPassword123!',
          name: 'Wrong Pass User',
        };

        await request(app.getHttpServer())
          .post('/graphql')
          .set(createGraphQLHeaders())
          .send({
            query: REGISTER_MUTATION,
            variables: { input: registerInput },
          });

        // Then try to login with wrong password
        const loginInput = {
          email: registerInput.email,
          password: 'WrongPassword123!',
        };

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .set(createGraphQLHeaders())
          .send({
            query: LOGIN_MUTATION,
            variables: { input: loginInput },
          });

        expect(response.status).toBe(200);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toBe('Invalid credentials');
      });
    });

    describe('Me Query', () => {
      it('should return current user when authenticated', async () => {
        // First register and login to get a token
        const registerInput = {
          email: 'meuser@example.com',
          password: 'MePassword123!',
          name: 'Me User',
        };

        const registerResponse = await request(app.getHttpServer())
          .post('/graphql')
          .set(createGraphQLHeaders())
          .send({
            query: REGISTER_MUTATION,
            variables: { input: registerInput },
          });

        expect(registerResponse.status).toBe(200);
        expect(registerResponse.body.data).toBeDefined();
        expect(registerResponse.body.data.register).toBeDefined();

        const token = registerResponse.body.data.register.token;

        // Then query me with the token
        const response = await request(app.getHttpServer())
          .post('/graphql')
          .set(createGraphQLHeaders(token))
          .send({
            query: ME_QUERY,
          });

        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.me).toBeDefined();
        expect(response.body.data.me.email).toBe(registerInput.email);
        expect(response.body.data.me.name).toBe(registerInput.name);
      });

      it('should fail to get current user when not authenticated', async () => {
        const response = await request(app.getHttpServer())
          .post('/graphql')
          .set(createGraphQLHeaders())
          .send({
            query: ME_QUERY,
          });

        expect(response.status).toBe(200);
        expect(response.body.errors).toBeDefined();
      });

      it('should fail to get current user with invalid token', async () => {
        const response = await request(app.getHttpServer())
          .post('/graphql')
          .set(createGraphQLHeaders('invalid-token'))
          .send({
            query: ME_QUERY,
          });

        expect(response.status).toBe(200);
        expect(response.body.errors).toBeDefined();
      });
    });
  });
});
