import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { asyncHandler } from '../middleware/validate';
import { validateBody } from '../middleware/validate';
import { loginDto } from '../dtos/auth.dto';

const router = Router();

/**
 * 认证路由
 * 处理用户登录等认证相关请求
 */

// 用户登录
router.post(
  '/login',
  validateBody(loginDto),
  asyncHandler(authController.login.bind(authController))
);

export default router;
