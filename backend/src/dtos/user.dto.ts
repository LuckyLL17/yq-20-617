import { z } from 'zod';
import { UserRole } from '@prisma/client';

/**
 * 创建用户 DTO
 */
export const CreateUserDto = z.object({
  /** 用户名 */
  username: z.string().min(3, { message: '用户名至少3个字符' }),
  /** 密码 */
  password: z.string().min(6, { message: '密码至少6个字符' }),
  /** 姓名 */
  name: z.string().min(1, { message: '姓名不能为空' }),
  /** 邮箱 */
  email: z.string().email({ message: '邮箱格式不正确' }),
  /** 角色 */
  role: z.nativeEnum(UserRole, { message: '角色无效' }),
  /** 电话 */
  phone: z.string().optional(),
  /** 部门 */
  department: z.string().optional(),
  /** 小时费率 */
  hourlyRate: z.number().positive({ message: '小时费率必须为正数' }).optional()
});

/**
 * 更新用户 DTO
 */
export const UpdateUserDto = z.object({
  /** 姓名 */
  name: z.string().min(1, { message: '姓名不能为空' }).optional(),
  /** 邮箱 */
  email: z.string().email({ message: '邮箱格式不正确' }).optional(),
  /** 角色 */
  role: z.nativeEnum(UserRole, { message: '角色无效' }).optional(),
  /** 密码 */
  password: z.string().min(6, { message: '密码至少6个字符' }).optional(),
  /** 电话 */
  phone: z.string().optional(),
  /** 部门 */
  department: z.string().optional(),
  /** 小时费率 */
  hourlyRate: z.number().positive({ message: '小时费率必须为正数' }).optional()
});

/**
 * 用户查询参数 DTO
 */
export const UserQueryDto = z.object({
  /** 角色过滤 */
  role: z.nativeEnum(UserRole).optional(),
  /** 页码 */
  page: z.coerce.number().int().positive().optional().default(1),
  /** 每页数量 */
  pageSize: z.coerce.number().int().positive().max(100).optional().default(10)
});

export type CreateUserDtoType = z.infer<typeof CreateUserDto>;
export type UpdateUserDtoType = z.infer<typeof UpdateUserDto>;
export type UserQueryDtoType = z.infer<typeof UserQueryDto>;
