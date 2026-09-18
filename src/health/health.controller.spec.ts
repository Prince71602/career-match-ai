import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { createApp } from '../main';

describe('Health endpoint', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApp();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns an ok status', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({ status: 'ok' });
  });
});
