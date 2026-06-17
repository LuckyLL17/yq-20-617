/**
 * 客户数据访问层
 * 封装所有客户相关的数据库操作
 */

import { prisma } from '../common/prisma';
import { Client, Prisma } from '@prisma/client';

export class ClientRepository {
  /**
   * 根据ID查找客户
   */
  async findById(id: string): Promise<Client | null> {
    return prisma.client.findUnique({
      where: { id }
    });
  }

  /**
   * 根据ID查找客户，包含关联案件
   */
  async findByIdWithCases(id: string) {
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
   */
  async findByEmail(email: string): Promise<Client | null> {
    return prisma.client.findFirst({
      where: { email }
    });
  }

  /**
   * 获取客户列表
   */
  async findAll(where?: Prisma.ClientWhereInput): Promise<Client[]> {
    return prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * 创建客户
   */
  async create(data: Prisma.ClientCreateInput): Promise<Client> {
    return prisma.client.create({ data });
  }

  /**
   * 更新客户
   */
  async update(id: string, data: Prisma.ClientUpdateInput): Promise<Client> {
    return prisma.client.update({
      where: { id },
      data
    });
  }

  /**
   * 删除客户
   */
  async delete(id: string): Promise<Client> {
    return prisma.client.delete({
      where: { id }
    });
  }
}

export const clientRepository = new ClientRepository();
