/**
 * 用户服务
 * 处理用户相关的业务逻辑
 */

import { userRepository } from '../repositories/user.repository';
import { NotFoundError, BusinessError } from '../common/errors';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from '../dto/user.dto';
import { UserRole, Prisma } from '@prisma/client';

export class UserService {
  /**
   * 获取所有用户
   */
  async getAllUsers(query?: UserQueryDto) {
    const where: Prisma.UserWhereInput = {
      isActive: true
    };

    if (query?.role) {
      where.role = query.role;
    }

    const users = await userRepository.findAll(where);
    return users.map(user => this.sanitizeUser(user));
  }

  /**
   * 获取律师列表
   */
  async getLawyers() {
    const lawyers = await userRepository.findLawyers();
    return lawyers.map(user => this.sanitizeUser(user));
  }

  /**
   * 根据ID获取用户
   */
  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }
    return this.sanitizeUser(user);
  }

  /**
   * 创建用户
   */
  async createUser(createUserDto: CreateUserDto) {
    // 检查用户名是否已存在
    const existingUser = await userRepository.findByUsername(createUserDto.username);
    if (existingUser) {
      throw new BusinessError('用户名已存在', 'USERNAME_EXISTS');
    }

    // 检查邮箱是否已存在
    const existingEmail = await userRepository.findByEmail(createUserDto.email);
    if (existingEmail) {
      throw new BusinessError('邮箱已被注册', 'EMAIL_EXISTS');
    }

    const user = await userRepository.create({
      ...createUserDto,
      passwordHash: createUserDto.password
    });

    return this.sanitizeUser(user);
  }

  /**
   * 更新用户
   */
  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    // 检查用户是否存在
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError('用户不存在');
    }

    // 如果更新用户名，检查是否冲突
    if (updateUserDto.username && updateUserDto.username !== existingUser.username) {
      const userWithUsername = await userRepository.findByUsername(updateUserDto.username);
      if (userWithUsername) {
        throw new BusinessError('用户名已存在', 'USERNAME_EXISTS');
      }
    }

    // 如果更新邮箱，检查是否冲突
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const userWithEmail = await userRepository.findByEmail(updateUserDto.email);
      if (userWithEmail) {
        throw new BusinessError('邮箱已被注册', 'EMAIL_EXISTS');
      }
    }

    const updateData: Prisma.UserUpdateInput = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.passwordHash = updateUserDto.password;
    }

    const user = await userRepository.update(id, updateData);
    return this.sanitizeUser(user);
  }

  /**
   * 禁用用户（软删除）
   */
  async deactivateUser(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    await userRepository.deactivate(id);
    return { message: '用户已禁用' };
  }

  /**
   * 清理用户敏感信息（移除密码哈希）
   */
  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}

export const userService = new UserService();
