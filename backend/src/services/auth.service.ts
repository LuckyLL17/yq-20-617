import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/UserRepository';
import { LoginDtoType } from '../dtos/auth.dto';
import { UnauthorizedError, ForbiddenError } from '../common/errors';

/**
 * 认证服务
 * 处理用户登录、Token 生成等认证相关业务逻辑
 */
class AuthService {
  /**
   * 用户登录
   */
  async login(loginDto: LoginDtoType): Promise<{ token: string; user: any }> {
    const { username, password } = loginDto;

    // 根据用户名查找用户
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new UnauthorizedError('用户名或密码错误', 'INVALID_CREDENTIALS');
    }

    // 检查账户是否被禁用
    if (!user.isActive) {
      throw new ForbiddenError('账户已被禁用', 'ACCOUNT_DISABLED');
    }

    // 验证密码
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      throw new UnauthorizedError('用户名或密码错误', 'INVALID_CREDENTIALS');
    }

    // 生成 JWT Token
    const secret = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      secret,
      { expiresIn: '24h' }
    );

    // 返回用户信息（不包含密码）
    const userInfo = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      department: user.department
    };

    return { token, user: userInfo };
  }

  /**
   * 验证 Token
   */
  verifyToken(token: string): any {
    const secret = process.env.JWT_SECRET || 'secret';
    return jwt.verify(token, secret);
  }
}

export const authService = new AuthService();
