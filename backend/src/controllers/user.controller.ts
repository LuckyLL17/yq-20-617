import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { success, created } from '../common/response';
import { CreateUserDtoType, UpdateUserDtoType } from '../dtos/user.dto';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * 用户控制器
 * 处理用户相关的 HTTP 请求
 */
class UserController {
  /**
   * 获取所有用户
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.getAllUsers();
      res.json(success(users, '获取用户列表成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取所有律师
   */
  async getLawyers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lawyers = await userService.getLawyers();
      res.json(success(lawyers, '获取律师列表成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 根据 ID 获取用户
   */
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserById(req.params.id);
      res.json(success(user, '获取用户信息成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建用户
   */
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createUserDto: CreateUserDtoType = req.validatedBody || req.body;
      const user = await userService.createUser(createUserDto);
      res.status(201).json(created(user, '创建用户成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新用户
   */
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updateUserDto: UpdateUserDtoType = req.validatedBody || req.body;
      const user = await userService.updateUser(req.params.id, updateUserDto);
      res.json(success(user, '更新用户成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除用户
   */
  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await userService.deleteUser(req.params.id);
      res.json(success(null, '用户已禁用'));
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
