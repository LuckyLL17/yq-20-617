import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { success } from '../common/response';
import { LoginDtoType } from '../dtos/auth.dto';

/**
 * 认证控制器
 * 处理认证相关的 HTTP 请求
 */
class AuthController {
  /**
   * 用户登录
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loginDto: LoginDtoType = req.validatedBody || req.body;
      const result = await authService.login(loginDto);
      res.json(success(result, '登录成功'));
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
