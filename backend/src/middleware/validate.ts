import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AuthRequest } from '../types/common';

/**
 * 异步路由处理器包装器
 * 捕获异步函数中的异常并传递给错误处理中间件
 */
export function asyncHandler(
  fn: (req: Request | AuthRequest, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req as AuthRequest, res, next)).catch(next);
  };
}

/**
 * 请求体验证中间件
 * 使用 Zod schema 验证请求体数据
 * @param schema Zod 验证 schema
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(result.error);
      return;
    }
    req.body = result.data;
    next();
  };
}

/**
 * 查询参数验证中间件
 * 使用 Zod schema 验证查询参数
 * @param schema Zod 验证 schema
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(result.error);
      return;
    }
    req.query = result.data;
    next();
  };
}

/**
 * 路径参数验证中间件
 * 使用 Zod schema 验证路径参数
 * @param schema Zod 验证 schema
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      next(result.error);
      return;
    }
    req.params = result.data;
    next();
  };
}
