import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from '../dtos/user.dto';
import { NotFoundError, ConflictError } from '../errors/ApiError';
import { UserRole } from '@prisma/client';

/**
 * 用户服务
 * 处理用户相关的业务逻辑
 */
export class UserService {
  /**
   * 获取用户列表
   * @param query 查询参数
   */
  async getUsers(query: UserQueryDto = {}) {
    return userRepository.findAll(query);
  }

  /**
   * 获取律师列表
   */
  async getLawyers() {
    return userRepository.findLawyers();
  }

  /**
   * 根据ID获取用户
   * @param id 用户ID
   */
  async getUserById(id: string) {
    const user = await userRepository.findByIdSafe(id);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }
    return user;
  }

  /**
   * 创建用户
   * @param dto 用户数据
   */
  async createUser(dto: CreateUserDto) {
    const usernameExists = await userRepository.existsByUsername(dto.username);
    if (usernameExists) {
      throw new ConflictError('用户名已存在');
    }

    const emailExists = await userRepository.existsByEmail(dto.email);
    if (emailExists) {
      throw new ConflictError('邮箱已存在');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return userRepository.create({ ...dto, passwordHash });
  }

  /**
   * 更新用户
   * @param id 用户ID
   * @param dto 更新数据
   */
  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    if (dto.username && dto.username !== user.username) {
      const usernameExists = await userRepository.existsByUsername(dto.username, id);
      if (usernameExists) {
        throw new ConflictError('用户名已存在');
      }
    }

    if (dto.email && dto.email !== user.email) {
      const emailExists = await userRepository.existsByEmail(dto.email, id);
      if (emailExists) {
        throw new ConflictError('邮箱已存在');
      }
    }

    const updateData: any = { ...dto };
    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
      delete updateData.password;
    }

    return userRepository.update(id, updateData);
  }

  /**
   * 禁用用户（软删除）
   * @param id 用户ID
   */
  async deactivateUser(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }
    await userRepository.deactivate(id);
  }
}

export const userService = new UserService();
