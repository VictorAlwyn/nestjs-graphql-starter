import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestingApp, closeTestingApp, TestApp } from './setup/test-setup';

describe('App (e2e)', () => {
  let testApp: TestApp;
  let app: INestApplication;

  beforeAll(async () => {
    testApp = await createTestingApp();
    app = testApp.app;
  });

  afterAll(async () => {
    await closeTestingApp(testApp);
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.status).toBe('ok');
    });
  });

  describe('GraphQL Endpoint', () => {
    it('should accept GraphQL queries', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: '{ __typename }',
        })
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.data).toBeDefined();
    });

    it('should handle invalid GraphQL queries', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: '{ invalidField }',
        })
        .expect(400); // Bad Request for invalid GraphQL

      expect(response.body).toBeDefined();
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('404 Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      await request(app.getHttpServer()).get('/non-existent').expect(404);
    });
  });
});
