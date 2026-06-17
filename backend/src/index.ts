import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import caseRoutes from './routes/cases';
import clientRoutes from './routes/clients';
import userRoutes from './routes/users';
import billingRoutes from './routes/billing';
import performanceRoutes from './routes/performance';

export const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/performance', performanceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '案件管理平台API运行正常' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

export default app;
