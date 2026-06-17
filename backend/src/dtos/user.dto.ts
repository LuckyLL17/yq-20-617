import { z } from 'zod';
import { UserRole } from '@prisma/client';

/**
 * 创建用户请求 DTO
 */
export const createUserDto = z.object({
  username: z.string().min(3, '用户名至少3个字符'),
  password: z.string().min(6, '密码至少6个字符'),
  name: z.string().min(1, '姓名不能为空'),
  email: z.string().email('邮箱格式不正确'),
  role: z.nativeEnum(UserRole, { message: '角色无效' }),
  phone: z.string().optional(),
  department: z.string().optional(),
  hourlyRate: z.number().positive('时薪必须为正数').optional()
});

export type CreateUserDto = z.infer<typeof createUserDto>;

/**
 * 更新用户请求 DTO
 */
export const updateUserDto = z.object({
  username: z.string().min(3, '用户名至少3个字符').optional(),
  password: z.string().min(6, '密码至少6个字符').optional(),
  name: z.string().min(1, '姓名不能为空').optional(),
  email: z.string().email('邮箱格式不正确').optional(),
  role: z.nativeEnum(UserRole, { message: '角色无效' }).optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  hourlyRate: z.number().positive('时薪必须为正数').optional(),
  isActive: z.boolean().optional()
});

export type UpdateUserDto = z.infer<typeof updateUserDto>;

/**
 * 用户查询参数 DTO
 */
export const userQueryDto = z.object({
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional()
});

export type UserQueryDto = z.infer<typeof userQueryDto>;
