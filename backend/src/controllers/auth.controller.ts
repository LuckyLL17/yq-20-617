/**
 * 认证控制器
 * 处理认证相关的HTTP请求
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { success } from '../common/response';
import { LoginDto } from '../dto/auth.dto';

export class AuthController {
  /**
   * 用户登录
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const loginDto: LoginDto = req.body;
      const result = await authService.login(loginDto);
      res.json(success(result, '登录成功'));
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
