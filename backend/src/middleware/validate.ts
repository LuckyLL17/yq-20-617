/**
 * DTO 验证中间件
 * 使用 Zod Schema 对请求参数进行验证
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodTypeAny } from 'zod';
import { ValidationError } from '../common/errors';

/**
 * 请求参数位置
 */
export type ValidationTarget = 'body' | 'query' | 'params';

/**
 * DTO 验证选项
 */
export interface ValidateOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * 创建 DTO 验证中间件
 * @param schemas 验证 schema 配置
 */
export function validate(schemas: ValidateOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * 验证请求体
 * @param schema Zod Schema
 */
export function validateBody(schema: ZodSchema) {
  return validate({ body: schema });
}

/**
 * 验证查询参数
 * @param schema Zod Schema
 */
export function validateQuery(schema: ZodSchema) {
  return validate({ query: schema });
}

/**
 * 验证路径参数
 * @param schema Zod Schema
 */
export function validateParams(schema: ZodSchema) {
  return validate({ params: schema });
}
