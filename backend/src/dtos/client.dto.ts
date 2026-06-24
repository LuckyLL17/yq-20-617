import { z } from 'zod';

/**
 * 创建客户请求 DTO
 */
export const createClientDto = z.object({
  name: z.string().min(1, '客户名称不能为空'),
  type: z.string().min(1, '客户类型不能为空'),
  idNumber: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('邮箱格式不正确').optional(),
  address: z.string().optional(),
  contactPerson: z.string().optional()
});

export type CreateClientDto = z.infer<typeof createClientDto>;

/**
 * 更新客户请求 DTO
 */
export const updateClientDto = z.object({
  name: z.string().min(1, '客户名称不能为空').optional(),
  type: z.string().min(1, '客户类型不能为空').optional(),
  idNumber: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('邮箱格式不正确').optional(),
  address: z.string().optional(),
  contactPerson: z.string().optional()
});

export type UpdateClientDto = z.infer<typeof updateClientDto>;

/**
 * 客户查询参数 DTO
 */
export const clientQueryDto = z.object({
  type: z.string().optional(),
  keyword: z.string().optional()
});

export type ClientQueryDto = z.infer<typeof clientQueryDto>;
