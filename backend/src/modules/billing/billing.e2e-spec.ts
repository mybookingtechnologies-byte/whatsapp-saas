import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';

describe('Billing (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let paymentId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    // Register and login to get token
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'billingadmin@example.com',
        password: 'StrongPassw0rd!',
        organizationName: 'BillingOrg',
        name: 'Billing Admin',
      });
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'billingadmin@example.com',
        password: 'StrongPassw0rd!',
      });
    accessToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('Create payment', async () => {
    const res = await request(app.getHttpServer())
      .post('/billing')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: 1000 });
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    paymentId = res.body.data.id;
  });

  it('Upload proof', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/billing/${paymentId}/proof`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ proofUrl: 'https://example.com/proof.png' });
    expect(res.body.success).toBe(true);
    expect(res.body.data.proofUrl).toBe('https://example.com/proof.png');
  });

  it('Approve payment', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/billing/${paymentId}/approve`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('APPROVED');
  });
});
