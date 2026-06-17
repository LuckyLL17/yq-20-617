import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '../common/errors';

/**
 * 认证用户信息接口
 */
export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
}

/**
 * 扩展 Request 接口，添加用户信息
 */
export interface AuthRequest extends Request {
  user?: AuthUser;
}

/**
 * JWT Token 验证中间件
 */
export function authenticateToken(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError('未提供认证令牌', 'NO_TOKEN');
  }

  const secret = process.env.JWT_SECRET || 'secret';

  try {
    const user = jwt.verify(token, secret) as AuthUser;
    req.user = user;
    next();
  } catch (error) {
    throw new UnauthorizedError('无效的认证令牌', 'INVALID_TOKEN');
  }
}

/**
 * 角色权限验证中间件
 */
export function requireRoles(roles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('未认证', 'NOT_AUTHENTICATED');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('权限不足', 'INSUFFICIENT_PERMISSIONS');
    }

    next();
  };
}
