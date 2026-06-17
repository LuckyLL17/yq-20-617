import bcrypt from 'bcryptjs';
import { Prisma, UserRole } from '@prisma/client';
import { userRepository } from '../repositories/UserRepository';
import { CreateUserDtoType, UpdateUserDtoType } from '../dtos/user.dto';
import { NotFoundError, ConflictError } from '../common/errors';

/**
 * 用户服务
 * 处理用户相关业务逻辑
 */
class UserService {
  /**
   * 用户查询字段选择（排除敏感信息）
   */
  private userSelect: Prisma.UserSelect = {
    id: true,
    username: true,
    name: true,
    email: true,
    role: true,
    phone: true,
    department: true,
    hourlyRate: true,
    createdAt: true
  };

  /**
   * 获取所有活跃用户
   */
  async getAllUsers(): Promise<any[]> {
    return userRepository.findActiveUsers(this.userSelect);
  }

  /**
   * 获取所有律师
   */
  async getLawyers(): Promise<any[]> {
    return userRepository.findByRole(UserRole.LAWYER, this.userSelect);
  }

  /**
   * 根据 ID 获取用户
   */
  async getUserById(id: string): Promise<any> {
    const user = await userRepository.findById(id, this.userSelect as any);
    if (!user) {
      throw new NotFoundError('用户不存在', 'USER_NOT_FOUND');
    }
    return user;
  }

  /**
   * 创建用户
   */
  async createUser(createUserDto: CreateUserDtoType): Promise<any> {
    // 检查用户名是否已存在
    const existingUser = await userRepository.findByUsername(createUserDto.username);
    if (existingUser) {
      throw new ConflictError('用户名已存在', 'USERNAME_EXISTS');
    }

    // 检查邮箱是否已存在
    const existingEmail = await userRepository.findByEmail(createUserDto.email);
    if (existingEmail) {
      throw new ConflictError('邮箱已存在', 'EMAIL_EXISTS');
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    // 创建用户
    const user = await userRepository.create(
      {
        ...createUserDto,
        passwordHash
      },
      this.userSelect as any
    );

    return user;
  }

  /**
   * 更新用户
   */
  async updateUser(id: string, updateUserDto: UpdateUserDtoType): Promise<any> {
    // 检查用户是否存在
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError('用户不存在', 'USER_NOT_FOUND');
    }

    const updateData: any = { ...updateUserDto };

    // 如果有密码，加密
    if (updateUserDto.password) {
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      delete updateData.password;
    }

    // 更新用户
    const user = await userRepository.update(id, updateData, this.userSelect as any);
    return user;
  }

  /**
   * 删除用户（软删除）
   */
  async deleteUser(id: string): Promise<void> {
    // 检查用户是否存在
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError('用户不存在', 'USER_NOT_FOUND');
    }

    await userRepository.deactivate(id);
  }
}

export const userService = new UserService();
