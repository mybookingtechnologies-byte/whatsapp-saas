"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const testing_1 = require("@nestjs/testing");
const app_module_1 = require("../../app.module");
describe('Messages (e2e)', () => {
    let app;
    let accessToken;
    let contactId;
    let messageId;
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
            email: 'messageadmin@example.com',
            password: 'StrongPassw0rd!',
            organizationName: 'MessageOrg',
            name: 'Message Admin',
        });
        const loginRes = await (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/login')
            .send({
            email: 'messageadmin@example.com',
            password: 'StrongPassw0rd!',
        });
        accessToken = loginRes.body.data.accessToken;
        // Create a contact for messaging
        const contactRes = await (0, supertest_1.default)(app.getHttpServer())
            .post('/contacts')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ name: 'Msg Contact', phone: '+1122334455', email: 'msg@example.com' });
        contactId = contactRes.body.data.id;
    });
    afterAll(async () => {
        await app.close();
    });
    it('Send message', async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .post('/messages')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ content: 'Test message', contactId });
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBeDefined();
        messageId = res.body.data.id;
    });
    it('Check status', async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .get(`/messages/${messageId}/status`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(messageId);
        expect(res.body.data.status).toBeDefined();
    });
});
