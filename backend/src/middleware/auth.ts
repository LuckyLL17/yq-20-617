import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/common';
import { UnauthorizedError, ForbiddenError } from '../errors/ApiError';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

/**
 * JWT 认证中间件
 * 验证请求头中的 Bearer Token，并将用户信息挂载到 req.user
 */
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('未提供认证令牌');
    }

    const user = jwt.verify(token, JWT_SECRET) as any;
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      next(err);
    } else {
      next(new ForbiddenError('无效的认证令牌'));
    }
  }
}

/**
 * 角色权限中间件
 * 验证用户是否拥有指定角色之一
 * @param roles 允许访问的角色列表
 */
export function requireRoles(roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('未认证');
      }
      if (!roles.includes(req.user.role)) {
        throw new ForbiddenError('权限不足');
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
