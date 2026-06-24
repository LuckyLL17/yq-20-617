import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { success } from '../utils/response';
import { LoginDto } from '../dtos/auth.dto';

/**
 * 认证控制器
 * 处理认证相关的 HTTP 请求
 */
export class AuthController {
  /**
   * 用户登录
   */
  async login(req: Request, res: Response): Promise<void> {
    const dto = req.body as LoginDto;
    const result = await authService.login(dto);
    success(res, result, '登录成功');
  }
}

export const authController = new AuthController();
