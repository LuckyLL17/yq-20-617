import { Client, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

/**
 * 客户数据访问层
 */
class ClientRepository extends BaseRepository<Client, Prisma.ClientCreateInput, Prisma.ClientUpdateInput> {
  constructor() {
    super('Client');
  }

  protected get model() {
    return this.prisma.client;
  }

  /**
   * 根据邮箱查找客户
   */
  async findByEmail(email: string): Promise<Client | null> {
    return this.model.findFirst({
      where: { email }
    });
  }

  /**
   * 获取客户及其关联案件
   */
  async findByIdWithCases(id: string): Promise<Client | null> {
    return this.model.findUnique({
      where: { id },
      include: {
        cases: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
            status: true,
            createdAt: true
          }
        }
      }
    });
  }

  /**
   * 获取所有客户列表
   */
  async findAll(): Promise<Client[]> {
    return this.model.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const clientRepository = new ClientRepository();
