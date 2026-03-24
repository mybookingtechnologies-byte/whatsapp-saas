"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const testing_1 = require("@nestjs/testing");
const app_module_1 = require("../../app.module");
describe('Billing (e2e)', () => {
    let app;
    let accessToken;
    let paymentId;
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
            email: 'billingadmin@example.com',
            password: 'StrongPassw0rd!',
            organizationName: 'BillingOrg',
            name: 'Billing Admin',
        });
        const loginRes = await (0, supertest_1.default)(app.getHttpServer())
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
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .post('/billing')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ amount: 1000 });
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBeDefined();
        paymentId = res.body.data.id;
    });
    it('Upload proof', async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .patch(`/billing/${paymentId}/proof`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ proofUrl: 'https://example.com/proof.png' });
        expect(res.body.success).toBe(true);
        expect(res.body.data.proofUrl).toBe('https://example.com/proof.png');
    });
    it('Approve payment', async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .patch(`/billing/${paymentId}/approve`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('APPROVED');
    });
});
