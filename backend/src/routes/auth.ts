import express from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    const hash = await bcrypt.hash(data.password, 10);
    // Create organization first
    const org = await prisma.organization.create({
      data: { name: data.name || data.email }
    });
    // Create user with organizationId
    const user = await prisma.user.create({
      data: { email: data.email, password: hash, name: data.name, organizationId: org.id },
    });
    res.status(201).json({ id: user.id, email: user.email, organizationId: org.id });
  } catch (err) {
    res.status(400).json({ message: err instanceof Error ? err.message : 'Invalid input' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.json({ token });
  } catch (err) {
    res.status(400).json({ message: err instanceof Error ? err.message : 'Invalid input' });
  }
});

router.get('/me', async (req, res) => {
  const auth = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
  if (!auth) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload = jwt.verify(auth, JWT_SECRET);
    res.json({ user: payload });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
