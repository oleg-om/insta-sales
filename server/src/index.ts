import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import socialRoutes from './routes/social.js';
import { errorHandler } from './middleware/errorHandler.js';
import { prisma } from './db.js';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (v === undefined || String(v).trim() === '') {
    console.error(`FATAL: ${name} is not set or empty`);
    process.exit(1);
  }
  return v;
}

const app = express();
const PORT = process.env.PORT || 3001;

requireEnv('DATABASE_URL');
requireEnv('JWT_SECRET');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/social', socialRoutes);

app.use(errorHandler);

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('Database connection OK');
  } catch (err) {
    console.error('FATAL: cannot connect to database', err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

bootstrap();
