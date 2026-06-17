import { Response } from 'express';

/**
 * 统一响应格式
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

/**
 * 分页响应格式
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 成功响应
 * @param res Express 响应对象
 * @param data 响应数据
 * @param message 响应消息
 * @param statusCode HTTP 状态码
 */
export function success<T>(
  res: Response,
  data?: T,
  message: string = '操作成功',
  statusCode: number = 200
): Response<ApiResponse<T>> {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
}

/**
 * 创建成功响应（201）
 * @param res Express 响应对象
 * @param data 响应数据
 * @param message 响应消息
 */
export function created<T>(
  res: Response,
  data?: T,
  message: string = '创建成功'
): Response<ApiResponse<T>> {
  return success(res, data, message, 201);
}

/**
 * 分页成功响应
 * @param res Express 响应对象
 * @param data 响应数据列表
 * @param page 当前页码
 * @param pageSize 每页数量
 * @param total 总数
 * @param message 响应消息
 */
export function paginated<T>(
  res: Response,
  data: T[],
  page: number,
  pageSize: number,
  total: number,
  message: string = '查询成功'
): Response<PaginatedResponse<T>> {
  return res.status(200).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  });
}

/**
 * 无数据成功响应
 * @param res Express 响应对象
 * @param message 响应消息
 */
export function noContent(res: Response, message: string = '操作成功'): Response<ApiResponse> {
  return success(res, undefined, message, 200);
}
