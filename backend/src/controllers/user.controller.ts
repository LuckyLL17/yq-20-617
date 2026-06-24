import { Response } from 'express';
import { userService } from '../services/user.service';
import { success, created, noContent } from '../utils/response';
import { AuthRequest } from '../types/common';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from '../dtos/user.dto';

/**
 * 用户控制器
 * 处理用户相关的 HTTP 请求
 */
export class UserController {
  /**
   * 获取用户列表
   */
  async getUsers(req: AuthRequest, res: Response): Promise<void> {
    const query = req.query as unknown as UserQueryDto;
    const users = await userService.getUsers(query);
    success(res, users, '获取用户列表成功');
  }

  /**
   * 获取律师列表
   */
  async getLawyers(req: AuthRequest, res: Response): Promise<void> {
    const lawyers = await userService.getLawyers();
    success(res, lawyers, '获取律师列表成功');
  }

  /**
   * 获取用户详情
   */
  async getUserById(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    success(res, user, '获取用户详情成功');
  }

  /**
   * 创建用户
   */
  async createUser(req: AuthRequest, res: Response): Promise<void> {
    const dto = req.body as CreateUserDto;
    const user = await userService.createUser(dto);
    created(res, user, '创建用户成功');
  }

  /**
   * 更新用户
   */
  async updateUser(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateUserDto;
    const user = await userService.updateUser(id, dto);
    success(res, user, '更新用户成功');
  }

  /**
   * 禁用用户
   */
  async deactivateUser(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    await userService.deactivateUser(id);
    noContent(res, '用户已禁用');
  }
}

export const userController = new UserController();
