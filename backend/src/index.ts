import express from 'express';
import cors from 'cors';
import routes from './routes';
import { connectDatabase } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { success } from './common/response';

const app = express();
const PORT = process.env.PORT || 3001;

/**
 * 中间件配置
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * 健康检查接口
 */
app.get('/api/health', (_req, res) => {
  res.json(success({ status: 'ok' }, '案件管理平台API运行正常'));
});

/**
 * API 路由
 */
app.use('/api', routes);

/**
 * 404 处理
 */
app.use(notFoundHandler);

/**
 * 全局异常处理
 */
app.use(errorHandler);

/**
 * 启动服务器
 */
async function startServer() {
  try {
    // 连接数据库
    await connectDatabase();

    // 启动 HTTP 服务器
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
      console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

// 启动服务器
startServer();

export default app;
