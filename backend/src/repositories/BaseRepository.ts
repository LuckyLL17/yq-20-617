import { PrismaClient } from '@prisma/client';
import { prisma } from '../config/database';

/**
 * 基础 Repository 抽象类
 * 提供通用的 CRUD 操作
 */
export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  /**
   * 获取模型访问器
   * 由子类实现
   */
  protected abstract get model(): any;

  /**
   * 根据 ID 查找记录
   */
  async findById(id: string, include?: any): Promise<T | null> {
    return this.model.findUnique({
      where: { id },
      include
    });
  }

  /**
   * 根据条件查找单条记录
   */
  async findOne(where: any, include?: any): Promise<T | null> {
    return this.model.findFirst({
      where,
      include
    });
  }

  /**
   * 查找所有记录
   */
  async findMany(
    where?: any,
    include?: any,
    orderBy?: any,
    skip?: number,
    take?: number
  ): Promise<T[]> {
    return this.model.findMany({
      where,
      include,
      orderBy,
      skip,
      take
    });
  }

  /**
   * 统计记录数量
   */
  async count(where?: any): Promise<number> {
    return this.model.count({ where });
  }

  /**
   * 创建记录
   */
  async create(data: CreateInput, include?: any): Promise<T> {
    return this.model.create({
      data,
      include
    });
  }

  /**
   * 批量创建记录
   */
  async createMany(data: CreateInput[]): Promise<{ count: number }> {
    return this.model.createMany({
      data
    });
  }

  /**
   * 根据 ID 更新记录
   */
  async update(id: string, data: UpdateInput, include?: any): Promise<T> {
    return this.model.update({
      where: { id },
      data,
      include
    });
  }

  /**
   * 根据条件更新多条记录
   */
  async updateMany(where: any, data: any): Promise<{ count: number }> {
    return this.model.updateMany({
      where,
      data
    });
  }

  /**
   * 根据 ID 删除记录
   */
  async delete(id: string): Promise<T> {
    return this.model.delete({
      where: { id }
    });
  }

  /**
   * 根据条件删除多条记录
   */
  async deleteMany(where: any): Promise<{ count: number }> {
    return this.model.deleteMany({ where });
  }

  /**
   * 分组查询
   */
  async groupBy(by: string[], where?: any, _count?: any, _sum?: any, _avg?: any): Promise<any[]> {
    return this.model.groupBy({
      by,
      where,
      _count,
      _sum,
      _avg
    });
  }
}
