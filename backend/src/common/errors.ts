/**
 * 业务异常基类
 */
export class ApiError extends Error {
  /** 错误状态码 */
  public statusCode: number;
  /** 错误代码 */
  public errorCode: string;

  constructor(statusCode: number, message: string, errorCode: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * 400 Bad Request - 请求参数错误
 */
export class BadRequestError extends ApiError {
  constructor(message: string = '请求参数错误', errorCode: string = 'BAD_REQUEST') {
    super(400, message, errorCode);
    this.name = 'BadRequestError';
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * 401 Unauthorized - 未认证
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = '未认证', errorCode: string = 'UNAUTHORIZED') {
    super(401, message, errorCode);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * 403 Forbidden - 权限不足
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = '权限不足', errorCode: string = 'FORBIDDEN') {
    super(403, message, errorCode);
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * 404 Not Found - 资源不存在
 */
export class NotFoundError extends ApiError {
  constructor(message: string = '资源不存在', errorCode: string = 'NOT_FOUND') {
    super(404, message, errorCode);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 409 Conflict - 资源冲突
 */
export class ConflictError extends ApiError {
  constructor(message: string = '资源冲突', errorCode: string = 'CONFLICT') {
    super(409, message, errorCode);
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * 422 Unprocessable Entity - 验证失败
 */
export class ValidationError extends ApiError {
  public errors: any[];

  constructor(message: string = '数据验证失败', errors: any[] = [], errorCode: string = 'VALIDATION_ERROR') {
    super(422, message, errorCode);
    this.errors = errors;
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 500 Internal Server Error - 服务器内部错误
 */
export class InternalServerError extends ApiError {
  constructor(message: string = '服务器内部错误', errorCode: string = 'INTERNAL_SERVER_ERROR') {
    super(500, message, errorCode);
    this.name = 'InternalServerError';
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
