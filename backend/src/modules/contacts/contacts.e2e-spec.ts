import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';

describe('Contacts (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let contactId: string;
  let organizationId: string;

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
        email: 'contactadmin@example.com',
        password: 'StrongPassw0rd!',
        organizationName: 'ContactOrg',
        name: 'Contact Admin',
      });
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'contactadmin@example.com',
        password: 'StrongPassw0rd!',
      });
    accessToken = loginRes.body.data.accessToken;
    organizationId = loginRes.body.data.user.organizationId;
  });

  afterAll(async () => {
    await app.close();
  });

  it('Create contact', async () => {
    const res = await request(app.getHttpServer())
      .post('/contacts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'John Doe', phone: '+1234567890', email: 'john@example.com' });
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    contactId = res.body.data.id;
  });

  it('Get contacts', async () => {
    const res = await request(app.getHttpServer())
      .get('/contacts')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('Update contact', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/contacts/${contactId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Jane Doe' });
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Jane Doe');
  });

  it('Delete contact', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/contacts/${contactId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.body.success).toBe(true);
  });
});
