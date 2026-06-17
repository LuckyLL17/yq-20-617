/**
 * 统一响应格式封装
 * 提供标准化的成功/失败响应结构
 */

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T | null;
  timestamp: number;
}

/**
 * 成功响应
 * @param data 响应数据
 * @param message 响应消息
 * @param code 状态码，默认200
 */
export function success<T>(data: T, message: string = '操作成功', code: number = 200): ApiResponse<T> {
  return {
    code,
    message,
    data,
    timestamp: Date.now()
  };
}

/**
 * 失败响应
 * @param message 错误消息
 * @param code 错误码，默认400
 * @param data 附加数据
 */
export function error(message: string = '操作失败', code: number = 400, data: any = null): ApiResponse<null> {
  return {
    code,
    message,
    data,
    timestamp: Date.now()
  };
}
