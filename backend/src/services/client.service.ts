import { clientRepository } from '../repositories/ClientRepository';
import { CreateClientDtoType, UpdateClientDtoType } from '../dtos/client.dto';
import { NotFoundError } from '../common/errors';

/**
 * 客户服务
 * 处理客户相关业务逻辑
 */
class ClientService {
  /**
   * 获取所有客户
   */
  async getAllClients(): Promise<any[]> {
    return clientRepository.findAll();
  }

  /**
   * 根据 ID 获取客户
   */
  async getClientById(id: string): Promise<any> {
    const client = await clientRepository.findByIdWithCases(id);
    if (!client) {
      throw new NotFoundError('客户不存在', 'CLIENT_NOT_FOUND');
    }
    return client;
  }

  /**
   * 创建客户
   */
  async createClient(createClientDto: CreateClientDtoType): Promise<any> {
    return clientRepository.create(createClientDto);
  }

  /**
   * 更新客户
   */
  async updateClient(id: string, updateClientDto: UpdateClientDtoType): Promise<any> {
    // 检查客户是否存在
    const existingClient = await clientRepository.findById(id);
    if (!existingClient) {
      throw new NotFoundError('客户不存在', 'CLIENT_NOT_FOUND');
    }

    return clientRepository.update(id, updateClientDto);
  }

  /**
   * 删除客户
   */
  async deleteClient(id: string): Promise<void> {
    // 检查客户是否存在
    const existingClient = await clientRepository.findById(id);
    if (!existingClient) {
      throw new NotFoundError('客户不存在', 'CLIENT_NOT_FOUND');
    }

    await clientRepository.delete(id);
  }

  /**
   * 根据邮箱查找客户
   */
  async getClientByEmail(email: string): Promise<any> {
    return clientRepository.findByEmail(email);
  }
}

export const clientService = new ClientService();
