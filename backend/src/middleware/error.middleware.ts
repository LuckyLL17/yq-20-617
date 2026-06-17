import { Request, Response, NextFunction } from 'express';
import { ApiError, ValidationError } from '../common/errors';
import { ApiResponse } from '../common/response';

/**
 * 全局异常处理中间件
 * 捕获所有异常并统一返回格式
 */
export function errorHandler(
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', error);

  // 处理业务异常
  if (error instanceof ApiError) {
    const response: ApiResponse = {
      code: error.statusCode,
      message: error.message,
      timestamp: Date.now()
    };

    // 如果是验证错误，附加错误详情
    if (error instanceof ValidationError) {
      (response as any).errors = error.errors;
    }

    res.status(error.statusCode).json(response);
    return;
  }

  // 处理 Prisma 已知错误
  if (error.code === 'P2002') {
    res.status(409).json({
      code: 409,
      message: '数据已存在，违反唯一约束',
      timestamp: Date.now()
    } as ApiResponse);
    return;
  }

  if (error.code === 'P2025') {
    res.status(404).json({
      code: 404,
      message: '记录不存在',
      timestamp: Date.now()
    } as ApiResponse);
    return;
  }

  // 处理其他未知错误
  res.status(500).json({
    code: 500,
    message: process.env.NODE_ENV === 'production'
      ? '服务器内部错误'
      : error.message || '服务器内部错误',
    timestamp: Date.now()
  } as ApiResponse);
}

/**
 * 404 处理中间件
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  res.status(404).json({
    code: 404,
    message: `接口不存在: ${req.method} ${req.path}`,
    timestamp: Date.now()
  } as ApiResponse);
}
