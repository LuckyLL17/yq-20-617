/**
 * 用户控制器
 * 处理用户相关的HTTP请求
 */

import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { success } from '../common/response';
import { AuthRequest } from '../middleware/auth';

export class UserController {
  /**
   * 获取用户列表
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers(req.query as any);
      res.json(success(users, '获取用户列表成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取律师列表
   */
  async getLawyers(req: Request, res: Response, next: NextFunction) {
    try {
      const lawyers = await userService.getLawyers();
      res.json(success(lawyers, '获取律师列表成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取用户详情
   */
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.json(success(user, '获取用户详情成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建用户
   */
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json(success(user, '创建用户成功', 201));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新用户
   */
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      res.json(success(user, '更新用户成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除用户（禁用）
   */
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.deactivateUser(req.params.id);
      res.json(success(result, '用户已禁用'));
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
