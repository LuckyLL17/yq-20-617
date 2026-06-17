/**
 * 统一响应格式
 */
export interface ApiResponse<T = any> {
  /** 响应状态码 */
  code: number;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data?: T;
  /** 响应时间戳 */
  timestamp: number;
}

/**
 * 成功响应
 */
export function success<T>(data?: T, message: string = 'success'): ApiResponse<T> {
  return {
    code: 200,
    message,
    data,
    timestamp: Date.now()
  };
}

/**
 * 创建成功响应（201）
 */
export function created<T>(data?: T, message: string = 'created'): ApiResponse<T> {
  return {
    code: 201,
    message,
    data,
    timestamp: Date.now()
  };
}

/**
 * 分页响应数据
 */
export interface PaginatedData<T> {
  /** 数据列表 */
  list: T[];
  /** 总数 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页数量 */
  pageSize: number;
  /** 总页数 */
  totalPages: number;
}

/**
 * 分页成功响应
 */
export function paginated<T>(
  list: T[],
  total: number,
  page: number,
  pageSize: number,
  message: string = 'success'
): ApiResponse<PaginatedData<T>> {
  return {
    code: 200,
    message,
    data: {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    },
    timestamp: Date.now()
  };
}
