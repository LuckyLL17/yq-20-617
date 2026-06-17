import { clientRepository } from '../repositories/client.repository';
import { CreateClientDto, UpdateClientDto, ClientQueryDto } from '../dtos/client.dto';
import { NotFoundError } from '../errors/ApiError';

/**
 * 客户服务
 * 处理客户相关的业务逻辑
 */
export class ClientService {
  /**
   * 获取客户列表
   * @param query 查询参数
   */
  async getClients(query: ClientQueryDto = {}) {
    return clientRepository.findAll(query);
  }

  /**
   * 根据ID获取客户
   * @param id 客户ID
   * @param withCases 是否包含关联案件
   */
  async getClientById(id: string, withCases: boolean = false) {
    const client = withCases
      ? await clientRepository.findByIdWithCases(id)
      : await clientRepository.findById(id);
    
    if (!client) {
      throw new NotFoundError('客户不存在');
    }
    return client;
  }

  /**
   * 创建客户
   * @param dto 客户数据
   */
  async createClient(dto: CreateClientDto) {
    return clientRepository.create(dto);
  }

  /**
   * 更新客户
   * @param id 客户ID
   * @param dto 更新数据
   */
  async updateClient(id: string, dto: UpdateClientDto) {
    const exists = await clientRepository.exists(id);
    if (!exists) {
      throw new NotFoundError('客户不存在');
    }
    return clientRepository.update(id, dto);
  }

  /**
   * 删除客户
   * @param id 客户ID
   */
  async deleteClient(id: string) {
    const exists = await clientRepository.exists(id);
    if (!exists) {
      throw new NotFoundError('客户不存在');
    }
    await clientRepository.delete(id);
  }
}

export const clientService = new ClientService();
