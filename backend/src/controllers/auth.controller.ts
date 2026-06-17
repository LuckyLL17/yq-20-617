import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { success } from '../types/response';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.json(success(result, '登录成功'));
    } catch (error) {
      next(error);
    }
  }
}
