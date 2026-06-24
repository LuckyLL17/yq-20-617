/**
 * API 错误基类
 * 所有业务异常都应继承此类，便于全局异常处理
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;

  constructor(statusCode: number, message: string, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - 请求参数错误
 */
export class BadRequestError extends ApiError {
  constructor(message: string = '请求参数错误', details?: any) {
    super(400, message, 'BAD_REQUEST', details);
  }
}

/**
 * 401 Unauthorized - 未认证
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = '未认证', details?: any) {
    super(401, message, 'UNAUTHORIZED', details);
  }
}

/**
 * 403 Forbidden - 权限不足
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = '权限不足', details?: any) {
    super(403, message, 'FORBIDDEN', details);
  }
}

/**
 * 404 Not Found - 资源不存在
 */
export class NotFoundError extends ApiError {
  constructor(message: string = '资源不存在', details?: any) {
    super(404, message, 'NOT_FOUND', details);
  }
}

/**
 * 409 Conflict - 资源冲突
 */
export class ConflictError extends ApiError {
  constructor(message: string = '资源冲突', details?: any) {
    super(409, message, 'CONFLICT', details);
  }
}

/**
 * 422 Unprocessable Entity - 验证失败
 */
export class ValidationError extends ApiError {
  constructor(message: string = '数据验证失败', details?: any) {
    super(422, message, 'VALIDATION_ERROR', details);
  }
}

/**
 * 500 Internal Server Error - 服务器内部错误
 */
export class InternalServerError extends ApiError {
  constructor(message: string = '服务器内部错误', details?: any) {
    super(500, message, 'INTERNAL_ERROR', details);
  }
}
