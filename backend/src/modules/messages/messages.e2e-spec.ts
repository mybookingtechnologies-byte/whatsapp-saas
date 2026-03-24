import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';

describe('Messages (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let contactId: string;
  let messageId: string;

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
        email: 'messageadmin@example.com',
        password: 'StrongPassw0rd!',
        organizationName: 'MessageOrg',
        name: 'Message Admin',
      });
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'messageadmin@example.com',
        password: 'StrongPassw0rd!',
      });
    accessToken = loginRes.body.data.accessToken;
    // Create a contact for messaging
    const contactRes = await request(app.getHttpServer())
      .post('/contacts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Msg Contact', phone: '+1122334455', email: 'msg@example.com' });
    contactId = contactRes.body.data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('Send message', async () => {
    const res = await request(app.getHttpServer())
      .post('/messages')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Test message', contactId });
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    messageId = res.body.data.id;
  });

  it('Check status', async () => {
    const res = await request(app.getHttpServer())
      .get(`/messages/${messageId}/status`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(messageId);
    expect(res.body.data.status).toBeDefined();
  });
});
