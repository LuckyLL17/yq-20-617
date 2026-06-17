import { User, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

/**
 * 用户数据访问层
 */
class UserRepository extends BaseRepository<User, Prisma.UserCreateInput, Prisma.UserUpdateInput> {
  constructor() {
    super('User');
  }

  protected get model() {
    return this.prisma.user;
  }

  /**
   * 根据用户名查找用户
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.model.findUnique({
      where: { username }
    });
  }

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.model.findUnique({
      where: { email }
    });
  }

  /**
   * 查找所有活跃用户
   */
  async findActiveUsers(select?: Prisma.UserSelect): Promise<User[]> {
    return this.model.findMany({
      where: { isActive: true },
      select,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * 根据角色查找用户
   */
  async findByRole(role: string, select?: Prisma.UserSelect): Promise<User[]> {
    return this.model.findMany({
      where: { isActive: true, role: role as any },
      select,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * 软删除用户（设置为非活跃）
   */
  async deactivate(id: string): Promise<User> {
    return this.model.update({
      where: { id },
      data: { isActive: false }
    });
  }
}

export const userRepository = new UserRepository();
