import { Request } from 'express';
import { UserRole } from '@prisma/client';

/**
 * 认证用户信息
 */
export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
}

/**
 * 带认证信息的请求对象
 */
export interface AuthRequest extends Request {
  user?: AuthUser;
}

/**
 * 分页查询参数
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * 排序参数
 */
export interface SortParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
