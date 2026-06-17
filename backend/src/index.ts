/**
 * 应用入口文件
 * 配置Express服务器、中间件和路由
 */

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import caseRoutes from './routes/cases';
import clientRoutes from './routes/clients';
import userRoutes from './routes/users';
import billingRoutes from './routes/billing';
import performanceRoutes from './routes/performance';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { success } from './common/response';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/performance', performanceRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json(success({ status: 'ok' }, '案件管理平台API运行正常'));
});

// 404处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

export default app;
