import { Response } from 'express';
import { clientService } from '../services/client.service';
import { success, created, noContent } from '../utils/response';
import { AuthRequest } from '../types/common';
import { CreateClientDto, UpdateClientDto, ClientQueryDto } from '../dtos/client.dto';

/**
 * 客户控制器
 * 处理客户相关的 HTTP 请求
 */
export class ClientController {
  /**
   * 获取客户列表
   */
  async getClients(req: AuthRequest, res: Response): Promise<void> {
    const query = req.query as unknown as ClientQueryDto;
    const clients = await clientService.getClients(query);
    success(res, clients, '获取客户列表成功');
  }

  /**
   * 获取客户详情
   */
  async getClientById(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const client = await clientService.getClientById(id, true);
    success(res, client, '获取客户详情成功');
  }

  /**
   * 创建客户
   */
  async createClient(req: AuthRequest, res: Response): Promise<void> {
    const dto = req.body as CreateClientDto;
    const client = await clientService.createClient(dto);
    created(res, client, '创建客户成功');
  }

  /**
   * 更新客户
   */
  async updateClient(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateClientDto;
    const client = await clientService.updateClient(id, dto);
    success(res, client, '更新客户成功');
  }

  /**
   * 删除客户
   */
  async deleteClient(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    await clientService.deleteClient(id);
    noContent(res, '客户已删除');
  }
}

export const clientController = new ClientController();
