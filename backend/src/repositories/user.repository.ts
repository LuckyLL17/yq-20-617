/**
 * 用户数据访问层
 * 封装所有用户相关的数据库操作
 */

import { prisma } from '../common/prisma';
import { User, UserRole, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

export class UserRepository {
  /**
   * 根据用户名查找用户
   */
  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username }
    });
  }

  /**
   * 根据ID查找用户
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  /**
   * 获取用户列表
   */
  async findAll(where?: Prisma.UserWhereInput): Promise<User[]> {
    return prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * 获取律师列表
   */
  async findLawyers(): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        isActive: true,
        role: UserRole.LAWYER
      },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * 创建用户
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    const passwordHash = await bcrypt.hash(data.passwordHash, 10);
    return prisma.user.create({
      data: {
        ...data,
        passwordHash
      }
    });
  }

  /**
   * 更新用户
   */
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    const updateData: Prisma.UserUpdateInput = { ...data };
    if (data.passwordHash && typeof data.passwordHash === 'string') {
      updateData.passwordHash = await bcrypt.hash(data.passwordHash, 10);
    }
    return prisma.user.update({
      where: { id },
      data: updateData
    });
  }

  /**
   * 禁用用户（软删除）
   */
  async deactivate(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { isActive: false }
    });
  }

  /**
   * 验证用户密码
   */
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user) return false;
    return bcrypt.compare(password, user.passwordHash);
  }
}

export const userRepository = new UserRepository();
