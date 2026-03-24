"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    name: zod_1.z.string().optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
router.post('/register', async (req, res) => {
    try {
        const data = registerSchema.parse(req.body);
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing)
            return res.status(409).json({ message: 'Email already registered' });
        const hash = await bcrypt_1.default.hash(data.password, 10);
        // Create organization first
        const org = await prisma.organization.create({
            data: { name: data.name || data.email }
        });
        // Create user with organizationId
        const user = await prisma.user.create({
            data: { email: data.email, password: hash, name: data.name, organizationId: org.id },
        });
        res.status(201).json({ id: user.id, email: user.email, organizationId: org.id });
    }
    catch (err) {
        res.status(400).json({ message: err instanceof Error ? err.message : 'Invalid input' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const data = loginSchema.parse(req.body);
        const user = await prisma.user.findUnique({ where: { email: data.email } });
        if (!user)
            return res.status(401).json({ message: 'Invalid credentials' });
        const valid = await bcrypt_1.default.compare(data.password, user.password);
        if (!valid)
            return res.status(401).json({ message: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.json({ token });
    }
    catch (err) {
        res.status(400).json({ message: err instanceof Error ? err.message : 'Invalid input' });
    }
});
router.get('/me', async (req, res) => {
    const auth = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    if (!auth)
        return res.status(401).json({ message: 'Unauthorized' });
    try {
        const payload = jsonwebtoken_1.default.verify(auth, JWT_SECRET);
        res.json({ user: payload });
    }
    catch {
        res.status(401).json({ message: 'Invalid token' });
    }
});
exports.default = router;
