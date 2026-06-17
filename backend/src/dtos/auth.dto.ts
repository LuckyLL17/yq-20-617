import { z } from 'zod';

/**
 * 登录请求 DTO
 */
export const loginDto = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空')
});

export type LoginDto = z.infer<typeof loginDto>;

/**
 * 登录响应 DTO
 */
export const loginResponseDto = z.object({
  token: z.string(),
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

export type LoginResponseDto = z.infer<typeof loginResponseDto>;
