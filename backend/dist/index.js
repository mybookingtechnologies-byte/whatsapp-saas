"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const pino_1 = __importDefault(require("pino"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("./routes/auth"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const logger = (0, pino_1.default)();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use((0, helmet_1.default)());
app.use((0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use('/api/auth', auth_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    logger.info(`Backend running on port ${PORT}`);
});
