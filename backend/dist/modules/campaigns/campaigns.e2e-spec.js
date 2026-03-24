"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const testing_1 = require("@nestjs/testing");
const app_module_1 = require("../../app.module");
describe('Campaigns (e2e)', () => {
    let app;
    let accessToken;
    let campaignId;
    let contactId;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
        // Register and login to get token
        await (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/register')
            .send({
            email: 'campaignadmin@example.com',
            password: 'StrongPassw0rd!',
            organizationName: 'CampaignOrg',
            name: 'Campaign Admin',
        });
        const loginRes = await (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/login')
            .send({
            email: 'campaignadmin@example.com',
            password: 'StrongPassw0rd!',
        });
        accessToken = loginRes.body.data.accessToken;
        // Create a contact for attaching
        const contactRes = await (0, supertest_1.default)(app.getHttpServer())
            .post('/contacts')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ name: 'Attach Contact', phone: '+1987654321', email: 'attach@example.com' });
        contactId = contactRes.body.data.id;
    });
    afterAll(async () => {
        await app.close();
    });
    it('Create campaign', async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .post('/campaigns')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ name: 'Test Campaign', content: 'Hello world!' });
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBeDefined();
        campaignId = res.body.data.id;
    });
    it('Attach contacts', async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .patch(`/campaigns/${campaignId}/contacts`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ contactIds: [contactId] });
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(campaignId);
    });
    it('Fetch campaign', async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .get(`/campaigns/${campaignId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(campaignId);
    });
});
