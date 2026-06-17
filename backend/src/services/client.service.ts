/**
 * 客户服务
 * 处理客户相关的业务逻辑
 */

import { clientRepository } from '../repositories/client.repository';
import { NotFoundError } from '../common/errors';
import { CreateClientDto, UpdateClientDto } from '../dto/client.dto';

export class ClientService {
  /**
   * 获取所有客户
   */
  async getAllClients() {
    return clientRepository.findAll();
  }

  /**
   * 根据ID获取客户
   */
  async getClientById(id: string) {
    const client = await clientRepository.findByIdWithCases(id);
    if (!client) {
      throw new NotFoundError('客户不存在');
    }
    return client;
  }

  /**
   * 创建客户
   */
  async createClient(createClientDto: CreateClientDto) {
    return clientRepository.create(createClientDto);
  }

  /**
   * 更新客户
   */
  async updateClient(id: string, updateClientDto: UpdateClientDto) {
    const client = await clientRepository.findById(id);
    if (!client) {
      throw new NotFoundError('客户不存在');
    }

    return clientRepository.update(id, updateClientDto);
  }

  /**
   * 删除客户
   */
  async deleteClient(id: string) {
    const client = await clientRepository.findById(id);
    if (!client) {
      throw new NotFoundError('客户不存在');
    }

    await clientRepository.delete(id);
    return { message: '客户已删除' };
  }
}

export const clientService = new ClientService();
