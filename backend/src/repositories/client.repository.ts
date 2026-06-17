import { prisma } from '../config/prisma';
import { Client } from '@prisma/client';
import { CreateClientDto, UpdateClientDto, ClientQueryDto } from '../dtos/client.dto';
import { Prisma } from '@prisma/client';

/**
 * 客户数据访问层
 * 封装所有客户相关的数据库操作
 */
export class ClientRepository {
  /**
   * 查询客户列表
   * @param query 查询参数
   */
  async findAll(query: ClientQueryDto = {}): Promise<Client[]> {
    const where: Prisma.ClientWhereInput = {};
    
    if (query.type) {
      where.type = query.type;
    }
    if (query.keyword) {
      where.OR = [
        { name: { contains: query.keyword } },
        { email: { contains: query.keyword } },
        { phone: { contains: query.keyword } }
      ];
    }

    return prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * 根据ID查找客户
   * @param id 客户ID
   */
  async findById(id: string): Promise<Client | null> {
    return prisma.client.findUnique({
      where: { id }
    });
  }

  /**
   * 根据ID查找客户（包含关联案件）
   * @param id 客户ID
   */
  async findByIdWithCases(id: string): Promise<any> {
    return prisma.client.findUnique({
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
   * 根据邮箱查找客户
   * @param email 邮箱
   */
  async findByEmail(email: string): Promise<Client | null> {
    return prisma.client.findFirst({
      where: { email }
    });
  }

  /**
   * 创建客户
   * @param data 客户数据
   */
  async create(data: CreateClientDto): Promise<Client> {
    return prisma.client.create({
      data
    });
  }

  /**
   * 更新客户
   * @param id 客户ID
   * @param data 更新数据
   */
  async update(id: string, data: UpdateClientDto): Promise<Client> {
    return prisma.client.update({
      where: { id },
      data
    });
  }

  /**
   * 删除客户
   * @param id 客户ID
   */
  async delete(id: string): Promise<void> {
    await prisma.client.delete({
      where: { id }
    });
  }

  /**
   * 检查客户是否存在
   * @param id 客户ID
   */
  async exists(id: string): Promise<boolean> {
    const count = await prisma.client.count({
      where: { id }
    });
    return count > 0;
  }
}

export const clientRepository = new ClientRepository();
