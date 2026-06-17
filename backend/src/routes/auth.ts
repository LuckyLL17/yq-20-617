/**
 * 认证路由
 * 处理登录等认证相关请求
 */

import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { loginDto } from '../dto/auth.dto';

const router = Router();

/**
 * @route POST /api/auth/login
 * @desc 用户登录
 * @access Public
 */
router.post('/login', validateBody(loginDto), authController.login);

export default router;
