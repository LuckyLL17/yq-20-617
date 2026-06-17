import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../types/errors';
import { fail } from '../types/response';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(`[Error] ${err.message}`, err.stack);

  if (err instanceof AppError) {
    res.status(err.statusCode).json(fail(err.message, err.code));
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        const target = (err.meta as any)?.target?.join(', ') || '字段';
        res.status(409).json(fail(`${target}已存在`, -1));
        return;
      case 'P2025':
        res.status(404).json(fail('资源不存在', -1));
        return;
      default:
        res.status(400).json(fail('数据库操作失败', -1));
        return;
    }
  }

  if (err.name === 'ZodError') {
    res.status(400).json(fail('请求数据验证失败', -1));
    return;
  }

  res.status(500).json(fail('服务器内部错误', -1));
}
