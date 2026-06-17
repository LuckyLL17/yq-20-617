import { Request, Response, NextFunction } from 'express';
import { ClientService } from '../services/client.service';
import { success } from '../types/response';

const clientService = new ClientService();

export class ClientController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const clients = await clientService.findAll();
      res.json(success(clients));
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await clientService.findById(req.params.id);
      res.json(success(client));
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await clientService.create(req.body);
      res.status(201).json(success(client, '创建客户成功'));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await clientService.update(req.params.id, req.body);
      res.json(success(client, '更新客户成功'));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await clientService.delete(req.params.id);
      res.json(success(null, '客户已删除'));
    } catch (error) {
      next(error);
    }
  }
}
