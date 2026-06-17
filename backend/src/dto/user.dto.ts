import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const createUserDto = z.object({
  username: z.string().min(3, '用户名至少3个字符'),
  password: z.string().min(6, '密码至少6个字符'),
  name: z.string().min(1, '姓名不能为空'),
  email: z.string().email('邮箱格式不正确'),
  role: z.nativeEnum(UserRole, { errorMap: () => ({ message: '无效的用户角色' }) }),
  phone: z.string().optional(),
  department: z.string().optional(),
  hourlyRate: z.number().positive().optional()
});

export type CreateUserDto = z.infer<typeof createUserDto>;

export const updateUserDto = z.object({
  username: z.string().min(3, '用户名至少3个字符').optional(),
  password: z.string().min(6, '密码至少6个字符').optional(),
  name: z.string().min(1, '姓名不能为空').optional(),
  email: z.string().email('邮箱格式不正确').optional(),
  role: z.nativeEnum(UserRole, { errorMap: () => ({ message: '无效的用户角色' }) }).optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  hourlyRate: z.number().positive().optional()
});

export type UpdateUserDto = z.infer<typeof updateUserDto>;
