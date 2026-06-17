/**
 * 认证模块 DTO
 * 定义登录等认证相关请求的验证规则
 */

import { z } from 'zod';

/**
 * 登录请求 DTO
 */
export const loginDto = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空')
});

export type LoginDto = z.infer<typeof loginDto>;
