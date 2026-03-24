import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import pino from 'pino';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const logger = pino();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`Backend running on port ${PORT}`);
});
