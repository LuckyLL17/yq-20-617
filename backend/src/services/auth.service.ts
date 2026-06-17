/**
 * 认证服务
 * 处理用户登录、令牌生成等认证相关业务逻辑
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { UnauthorizedError, ForbiddenError } from '../common/errors';
import { LoginDto } from '../dto/auth.dto';
import { User } from '@prisma/client';

export interface AuthPayload {
  id: string;
  username: string;
  role: string;
}

export interface LoginResult {
  token: string;
  user: {
    id: string;
    username: string;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    department: string | null;
  };
}

export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'secret';
    this.jwtExpiresIn = '24h';
  }

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto): Promise<LoginResult> {
    const { username, password } = loginDto;

    // 查找用户
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new UnauthorizedError('用户名或密码错误');
    }

    // 检查账户状态
    if (!user.isActive) {
      throw new ForbiddenError('账户已被禁用');
    }

    // 验证密码
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      throw new UnauthorizedError('用户名或密码错误');
    }

    // 生成令牌
    const token = this.generateToken(user);

    return {
      token,
      user: this.sanitizeUser(user)
    };
  }

  /**
   * 生成 JWT 令牌
   */
  generateToken(user: User): string {
    const payload: AuthPayload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    return jwt.sign(payload as any, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn as any
    });
  }

  /**
   * 验证 JWT 令牌
   */
  verifyToken(token: string): AuthPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as AuthPayload;
    } catch (error) {
      throw new UnauthorizedError('无效的认证令牌');
    }
  }

  /**
   * 清理用户敏感信息
   */
  private sanitizeUser(user: User) {
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      department: user.department
    };
  }
}

export const authService = new AuthService();
