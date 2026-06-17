import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '../types/errors';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new UnauthorizedError('未提供认证令牌'));
  }

  const secret = process.env.JWT_SECRET || 'secret';
  jwt.verify(token, secret, (err: any, user: any) => {
    if (err) {
      return next(new ForbiddenError('无效的认证令牌'));
    }
    req.user = user;
    next();
  });
}

export function requireRoles(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('未认证'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('权限不足'));
    }
    next();
  };
}
