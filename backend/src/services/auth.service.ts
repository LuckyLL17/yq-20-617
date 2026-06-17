import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { LoginDto } from '../dtos/auth.dto';
import { UnauthorizedError, ForbiddenError } from '../errors/ApiError';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = '24h';

/**
 * 认证服务
 * 处理用户登录、令牌生成等认证相关业务逻辑
 */
export class AuthService {
  /**
   * 用户登录
   * @param dto 登录数据
   */
  async login(dto: LoginDto): Promise<{
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
  }> {
    const user = await userRepository.findByUsername(dto.username);

    if (!user) {
      throw new UnauthorizedError('用户名或密码错误');
    }

    if (!user.isActive) {
      throw new ForbiddenError('账户已被禁用');
    }

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!validPassword) {
      throw new UnauthorizedError('用户名或密码错误');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department
      }
    };
  }

  /**
   * 验证令牌
   * @param token JWT 令牌
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      throw new ForbiddenError('无效的认证令牌');
    }
  }
}

export const authService = new AuthService();
