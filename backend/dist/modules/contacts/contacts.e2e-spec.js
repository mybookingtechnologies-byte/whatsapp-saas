"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const testing_1 = require("@nestjs/testing");
const app_module_1 = require("../../app.module");
describe('Contacts (e2e)', () => {
    let app;
    let accessToken;
    let contactId;
    let organizationId;
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
            email: 'contactadmin@example.com',
            password: 'StrongPassw0rd!',
            organizationName: 'ContactOrg',
            name: 'Contact Admin',
        });
        const loginRes = await (0, supertest_1.default)(app.getHttpServer())
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
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .post('/contacts')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ name: 'John Doe', phone: '+1234567890', email: 'john@example.com' });
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBeDefined();
        contactId = res.body.data.id;
    });
    it('Get contacts', async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .get('/contacts')
            .set('Authorization', `Bearer ${accessToken}`);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
    it('Update contact', async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .patch(`/contacts/${contactId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ name: 'Jane Doe' });
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe('Jane Doe');
    });
    it('Delete contact', async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .delete(`/contacts/${contactId}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(res.body.success).toBe(true);
    });
});
