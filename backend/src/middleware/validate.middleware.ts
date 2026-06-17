import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../common/errors';

/**
 * DTO 验证中间件
 * 使用 Zod Schema 验证请求体、查询参数或路径参数
 */
export function validateDto(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
      const validated = schema.parse(data);

      // 将验证后的数据存入 request 对象
      if (source === 'body') {
        (req as any).validatedBody = validated;
      } else if (source === 'query') {
        (req as any).validatedQuery = validated;
      } else {
        (req as any).validatedParams = validated;
      }

      next();
    } catch (error: any) {
      // 提取 Zod 验证错误信息
      const errors = error.issues?.map((issue: any) => ({
        field: issue.path.join('.'),
        message: issue.message
      })) || [];

      next(new ValidationError('数据验证失败', errors));
    }
  };
}

/**
 * 验证请求体
 */
export function validateBody(schema: ZodSchema) {
  return validateDto(schema, 'body');
}

/**
 * 验证查询参数
 */
export function validateQuery(schema: ZodSchema) {
  return validateDto(schema, 'query');
}

/**
 * 验证路径参数
 */
export function validateParams(schema: ZodSchema) {
  return validateDto(schema, 'params');
}

/**
 * 扩展 Request 类型，添加验证后的数据
 */
declare global {
  namespace Express {
    interface Request {
      validatedBody?: any;
      validatedQuery?: any;
      validatedParams?: any;
    }
  }
}
