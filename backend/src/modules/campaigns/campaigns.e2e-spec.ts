import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';

describe('Campaigns (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let campaignId: string;
  let contactId: string;

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
        email: 'campaignadmin@example.com',
        password: 'StrongPassw0rd!',
        organizationName: 'CampaignOrg',
        name: 'Campaign Admin',
      });
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'campaignadmin@example.com',
        password: 'StrongPassw0rd!',
      });
    accessToken = loginRes.body.data.accessToken;
    // Create a contact for attaching
    const contactRes = await request(app.getHttpServer())
      .post('/contacts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Attach Contact', phone: '+1987654321', email: 'attach@example.com' });
    contactId = contactRes.body.data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('Create campaign', async () => {
    const res = await request(app.getHttpServer())
      .post('/campaigns')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test Campaign', content: 'Hello world!' });
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    campaignId = res.body.data.id;
  });

  it('Attach contacts', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/campaigns/${campaignId}/contacts`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ contactIds: [contactId] });
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(campaignId);
  });

  it('Fetch campaign', async () => {
    const res = await request(app.getHttpServer())
      .get(`/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(campaignId);
  });
});
