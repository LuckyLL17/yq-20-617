import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { NotFoundError, UnauthorizedError, ForbiddenError } from '../types/errors';
import { LoginDto } from '../dto/auth.dto';

const userRepo = new UserRepository();

export class AuthService {
  async login(dto: LoginDto) {
    const user = await userRepo.findByUsername(dto.username);

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

    const secret = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      secret,
      { expiresIn: '24h' }
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
}
