"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const testing_1 = require("@nestjs/testing");
const app_module_1 = require("../../app.module");
describe('Auth Flow (e2e)', () => {
    let app;
    let accessToken;
    let refreshToken;
    let userId;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    it('Register', async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer())
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
        const res = await (0, supertest_1.default)(app.getHttpServer())
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
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/refresh-token')
            .send({ refreshToken });
        expect(res.body.success).toBe(true);
        expect(res.body.data.accessToken).toBeDefined();
        expect(res.body.data.refreshToken).toBeDefined();
        expect(res.body.data.user).toBeDefined();
    });
});
