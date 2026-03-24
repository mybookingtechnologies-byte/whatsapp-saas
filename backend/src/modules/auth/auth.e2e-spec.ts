import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';

describe('Auth Flow (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Register', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'testuser@example.com',
        password: 'StrongPassw0rd!',
        organizationName: 'TestOrg',
        name: 'Test User',
      });
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user).toBeDefined();
    userId = res.body.data.user.id;
    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it('Login', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'StrongPassw0rd!',
      });
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user).toBeDefined();
    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it('Refresh Token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh-token')
      .send({ refreshToken });
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user).toBeDefined();
  });
});
