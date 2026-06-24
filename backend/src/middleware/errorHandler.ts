import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError, ValidationError, InternalServerError } from '../errors/ApiError';

/**
 * 全局异常处理中间件
 * 统一处理所有异常，返回标准化的错误响应
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} -`, err);

  if (err instanceof ZodError) {
    const validationError = new ValidationError('数据验证失败', {
      errors: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    });
    res.status(validationError.statusCode).json({
      success: false,
      message: validationError.message,
      code: validationError.code,
      details: validationError.details,
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      details: err.details,
      timestamp: new Date().toISOString()
    });
    return;
  }

  const internalError = new InternalServerError('服务器内部错误');
  res.status(internalError.statusCode).json({
    success: false,
    message: internalError.message,
    code: internalError.code,
    timestamp: new Date().toISOString()
  });
}

/**
 * 404 处理中间件
 * 处理未匹配到路由的请求
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在',
    code: 'NOT_FOUND',
    path: req.path,
    timestamp: new Date().toISOString()
  });
}
