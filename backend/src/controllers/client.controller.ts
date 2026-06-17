/**
 * 客户控制器
 * 处理客户相关的HTTP请求
 */

import { Request, Response, NextFunction } from 'express';
import { clientService } from '../services/client.service';
import { success } from '../common/response';

export class ClientController {
  /**
   * 获取客户列表
   */
  async getAllClients(req: Request, res: Response, next: NextFunction) {
    try {
      const clients = await clientService.getAllClients();
      res.json(success(clients, '获取客户列表成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取客户详情
   */
  async getClientById(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await clientService.getClientById(req.params.id);
      res.json(success(client, '获取客户详情成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建客户
   */
  async createClient(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await clientService.createClient(req.body);
      res.status(201).json(success(client, '创建客户成功', 201));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新客户
   */
  async updateClient(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await clientService.updateClient(req.params.id, req.body);
      res.json(success(client, '更新客户成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除客户
   */
  async deleteClient(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await clientService.deleteClient(req.params.id);
      res.json(success(result, '客户已删除'));
    } catch (error) {
      next(error);
    }
  }
}

export const clientController = new ClientController();
