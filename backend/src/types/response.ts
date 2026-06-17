export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export function success<T>(data: T, message: string = '操作成功'): ApiResponse<T> {
  return { code: 0, message, data };
}

export function fail(message: string = '操作失败', code: number = -1): ApiResponse<null> {
  return { code, message, data: null };
}
