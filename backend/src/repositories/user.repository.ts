import { prisma } from '../config/prisma';
import { User, UserRole } from '@prisma/client';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from '../dtos/user.dto';
import { Prisma } from '@prisma/client';

/**
 * 用户数据访问层
 * 封装所有用户相关的数据库操作
 */
export class UserRepository {
  /**
   * 用户选择字段（排除密码哈希）
   */
  private selectFields = {
    id: true,
    username: true,
    name: true,
    email: true,
    role: true,
    phone: true,
    department: true,
    hourlyRate: true,
    createdAt: true,
    updatedAt: true,
    isActive: true
  };

  /**
   * 根据用户名查找用户
   * @param username 用户名
   */
  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username }
    });
  }

  /**
   * 根据ID查找用户
   * @param id 用户ID
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  /**
   * 根据ID查找用户（排除密码）
   * @param id 用户ID
   */
  async findByIdSafe(id: string): Promise<Prisma.UserGetPayload<{ select: typeof this.selectFields }> | null> {
    return prisma.user.findUnique({
      where: { id },
      select: this.selectFields
    });
  }

  /**
   * 查询用户列表
   * @param query 查询参数
   */
  async findAll(query: UserQueryDto = {}): Promise<Prisma.UserGetPayload<{ select: typeof this.selectFields }>[]> {
    const where: Prisma.UserWhereInput = {};
    
    if (query.role) {
      where.role = query.role;
    }
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    return prisma.user.findMany({
      where,
      select: this.selectFields,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * 查询律师列表
   */
  async findLawyers(): Promise<Prisma.UserGetPayload<{ select: typeof this.selectFields }>[]> {
    return prisma.user.findMany({
      where: {
        isActive: true,
        role: UserRole.LAWYER
      },
      select: this.selectFields,
      orderBy: { name: 'asc' }
    });
  }

  /**
   * 创建用户
   * @param data 用户数据
   */
  async create(data: CreateUserDto & { passwordHash: string }): Promise<Prisma.UserGetPayload<{ select: typeof this.selectFields }>> {
    return prisma.user.create({
      data,
      select: this.selectFields
    });
  }

  /**
   * 更新用户
   * @param id 用户ID
   * @param data 更新数据
   */
  async update(id: string, data: UpdateUserDto & { passwordHash?: string }): Promise<Prisma.UserGetPayload<{ select: typeof this.selectFields }>> {
    return prisma.user.update({
      where: { id },
      data,
      select: this.selectFields
    });
  }

  /**
   * 软删除用户（禁用）
   * @param id 用户ID
   */
  async deactivate(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });
  }

  /**
   * 检查用户名是否已存在
   * @param username 用户名
   * @param excludeId 排除的用户ID
   */
  async existsByUsername(username: string, excludeId?: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: {
        username,
        id: excludeId ? { not: excludeId } : undefined
      }
    });
    return count > 0;
  }

  /**
   * 检查邮箱是否已存在
   * @param email 邮箱
   * @param excludeId 排除的用户ID
   */
  async existsByEmail(email: string, excludeId?: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: {
        email,
        id: excludeId ? { not: excludeId } : undefined
      }
    });
    return count > 0;
  }
}

export const userRepository = new UserRepository();
