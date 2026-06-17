/**
 * 全局错误处理中间件
 * 统一捕获和处理应用中的所有异常
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../common/errors';
import { error as errorResponse } from '../common/response';
import { ZodError } from 'zod';

/**
 * 全局错误处理中间件
 * 捕获所有异常并返回统一格式的错误响应
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[${new Date().toISOString()}] Error:`, err);

  // Zod 验证错误
  if (err instanceof ZodError) {
    const details = err.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message
    }));
    return res.status(400).json(
      errorResponse('参数验证失败', 400, { details })
    );
  }

  // 自定义业务异常
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      errorResponse(err.message, err.statusCode, err.details)
    );
  }

  // 未知错误
  return res.status(500).json(
    errorResponse('服务器内部错误', 500, process.env.NODE_ENV === 'development' ? err.message : null)
  );
}

/**
 * 404 处理中间件
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  return res.status(404).json(
    errorResponse('请求的资源不存在', 404, { path: req.path })
  );
}
