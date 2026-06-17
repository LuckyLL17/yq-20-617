/**
 * 认证中间件
 * 提供JWT令牌验证和角色权限检查
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '../common/errors';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    username: string;
  };
}

/**
 * JWT认证中间件
 * 验证请求头中的Bearer令牌
 */
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError('未提供认证令牌');
  }

  const secret = process.env.JWT_SECRET || 'secret';

  try {
    const user = jwt.verify(token, secret) as AuthRequest['user'];
    req.user = user;
    next();
  } catch (error) {
    next(new UnauthorizedError('无效的认证令牌'));
  }
}

/**
 * 角色权限中间件
 * 检查用户是否拥有指定角色
 */
export function requireRoles(roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('未认证');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('权限不足');
    }

    next();
  };
}
