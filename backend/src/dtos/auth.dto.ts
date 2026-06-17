import { z } from 'zod';

/**
 * 登录请求 DTO
 */
export const LoginDto = z.object({
  /** 用户名 */
  username: z.string().min(1, { message: '用户名不能为空' }),
  /** 密码 */
  password: z.string().min(1, { message: '密码不能为空' })
});

/**
 * 登录响应 DTO
 */
export const LoginResponseDto = z.object({
  /** JWT Token */
  token: z.string(),
  /** 用户信息 */
  user: z.object({
    id: z.string(),
    username: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.string(),
    phone: z.string().nullable(),
    department: z.string().nullable()
  })
});

export type LoginDtoType = z.infer<typeof LoginDto>;
export type LoginResponseDtoType = z.infer<typeof LoginResponseDto>;
