import { Request, Response, NextFunction } from 'express';
import { clientService } from '../services/client.service';
import { success, created } from '../common/response';
import { CreateClientDtoType, UpdateClientDtoType } from '../dtos/client.dto';

/**
 * 客户控制器
 * 处理客户相关的 HTTP 请求
 */
class ClientController {
  /**
   * 获取所有客户
   */
  async getAllClients(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clients = await clientService.getAllClients();
      res.json(success(clients, '获取客户列表成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 根据 ID 获取客户
   */
  async getClientById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const client = await clientService.getClientById(req.params.id);
      res.json(success(client, '获取客户信息成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建客户
   */
  async createClient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createClientDto: CreateClientDtoType = req.validatedBody || req.body;
      const client = await clientService.createClient(createClientDto);
      res.status(201).json(created(client, '创建客户成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新客户
   */
  async updateClient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updateClientDto: UpdateClientDtoType = req.validatedBody || req.body;
      const client = await clientService.updateClient(req.params.id, updateClientDto);
      res.json(success(client, '更新客户成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除客户
   */
  async deleteClient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await clientService.deleteClient(req.params.id);
      res.json(success(null, '客户已删除'));
    } catch (error) {
      next(error);
    }
  }
}

export const clientController = new ClientController();
