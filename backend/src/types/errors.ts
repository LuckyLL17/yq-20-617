export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: number;

  constructor(message: string, statusCode: number = 400, code: number = -1) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = '资源不存在') {
    super(message, 404, -1);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = '未认证') {
    super(message, 401, -1);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = '权限不足') {
    super(message, 403, -1);
    this.name = 'ForbiddenError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string = '请求数据验证失败') {
    super(message, 400, -1);
    this.name = 'ValidationError';
  }
}
