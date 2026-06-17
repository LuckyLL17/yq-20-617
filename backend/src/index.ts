import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import caseRoutes from './routes/cases';
import clientRoutes from './routes/clients';
import userRoutes from './routes/users';
import billingRoutes from './routes/billing';
import performanceRoutes from './routes/performance';
import { errorHandler } from './middleware/errorHandler';
import { success } from './types/response';

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
  res.json(success({ status: 'ok' }, '案件管理平台API运行正常'));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

export default app;
