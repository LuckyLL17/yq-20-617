import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { success } from '../types/response';

const userService = new UserService();

export class UserController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.findAll();
      res.json(success(users));
    } catch (error) {
      next(error);
    }
  }

  async findLawyers(req: Request, res: Response, next: NextFunction) {
    try {
      const lawyers = await userService.findLawyers();
      res.json(success(lawyers));
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.findById(req.params.id);
      res.json(success(user));
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.create(req.body);
      res.status(201).json(success(user, '创建用户成功'));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.update(req.params.id, req.body);
      res.json(success(user, '更新用户成功'));
    } catch (error) {
      next(error);
    }
  }

  async softDelete(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.softDelete(req.params.id);
      res.json(success(null, '用户已禁用'));
    } catch (error) {
      next(error);
    }
  }
}
