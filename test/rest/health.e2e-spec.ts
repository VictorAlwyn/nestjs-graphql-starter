import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import {
  createTestingApp,
  closeTestingApp,
  TestApp,
  REST_ENDPOINTS,
} from '../setup/test-setup';

describe('REST Health (e2e)', () => {
  let testApp: TestApp;
  let app: INestApplication;

  beforeAll(async () => {
    testApp = await createTestingApp();
    app = testApp.app;
  });

  afterAll(async () => {
    await closeTestingApp(testApp);
  });

  describe('Health Check Endpoint', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get(REST_ENDPOINTS.HEALTH)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.status).toBe('ok');
    });

    it('should return detailed health information', async () => {
      const response = await request(app.getHttpServer())
        .get(`${REST_ENDPOINTS.HEALTH}/detailed`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.status).toBe('ok');
      expect(response.body.details).toBeDefined();
    });

    it('should return health with queue status when requested', async () => {
      const response = await request(app.getHttpServer())
        .get(`${REST_ENDPOINTS.HEALTH}/detailed?includeQueue=true`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.status).toBe('ok');
      expect(response.body.details).toBeDefined();
    });
  });

  describe('OAuth Callback Endpoint', () => {
    it('should handle OAuth callback for Google', async () => {
      const oauthData = {
        code: 'test-auth-code',
        state: 'test-state',
      };

      const response = await request(app.getHttpServer())
        .post(REST_ENDPOINTS.OAUTH_CALLBACK.replace(':provider', 'google'))
        .send(oauthData)
        .expect(302); // Should redirect

      expect(response.headers.location).toBeDefined();
    });

    it('should handle OAuth callback for Facebook', async () => {
      const oauthData = {
        code: 'test-auth-code',
        state: 'test-state',
      };

      const response = await request(app.getHttpServer())
        .post(REST_ENDPOINTS.OAUTH_CALLBACK.replace(':provider', 'facebook'))
        .send(oauthData)
        .expect(302); // Should redirect

      expect(response.headers.location).toBeDefined();
    });

    it('should handle OAuth callback with missing code', async () => {
      const oauthData = {
        state: 'test-state',
      };

      const response = await request(app.getHttpServer())
        .post(REST_ENDPOINTS.OAUTH_CALLBACK.replace(':provider', 'google'))
        .send(oauthData)
        .expect(302); // Should redirect to success in test environment

      expect(response.headers.location).toBeDefined();
      expect(response.headers.location).toContain('callback');
    });

    it('should handle invalid OAuth provider', async () => {
      const oauthData = {
        code: 'test-auth-code',
        state: 'test-state',
      };

      const response = await request(app.getHttpServer())
        .post(
          REST_ENDPOINTS.OAUTH_CALLBACK.replace(
            ':provider',
            'invalid-provider',
          ),
        )
        .send(oauthData)
        .expect(302); // Should redirect to success in test environment

      expect(response.headers.location).toBeDefined();
      expect(response.headers.location).toContain('callback');
    });
  });

  describe('404 Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      await request(app.getHttpServer())
        .get('/non-existent-endpoint')
        .expect(404);
    });

    it('should return 404 for non-existent GraphQL endpoint', async () => {
      await request(app.getHttpServer())
        .post('/non-existent-graphql')
        .expect(404);
    });
  });
});
