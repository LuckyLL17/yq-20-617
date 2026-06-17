import { z } from 'zod';

/**
 * 创建客户 DTO
 */
export const CreateClientDto = z.object({
  /** 客户名称 */
  name: z.string().min(1, { message: '客户名称不能为空' }),
  /** 客户类型 */
  type: z.string().min(1, { message: '客户类型不能为空' }),
  /** 身份证号/统一社会信用代码 */
  idNumber: z.string().optional(),
  /** 电话 */
  phone: z.string().optional(),
  /** 邮箱 */
  email: z.string().email({ message: '邮箱格式不正确' }).optional(),
  /** 地址 */
  address: z.string().optional(),
  /** 联系人 */
  contactPerson: z.string().optional()
});

/**
 * 更新客户 DTO
 */
export const UpdateClientDto = z.object({
  /** 客户名称 */
  name: z.string().min(1, { message: '客户名称不能为空' }).optional(),
  /** 客户类型 */
  type: z.string().min(1, { message: '客户类型不能为空' }).optional(),
  /** 身份证号/统一社会信用代码 */
  idNumber: z.string().optional(),
  /** 电话 */
  phone: z.string().optional(),
  /** 邮箱 */
  email: z.string().email({ message: '邮箱格式不正确' }).optional(),
  /** 地址 */
  address: z.string().optional(),
  /** 联系人 */
  contactPerson: z.string().optional()
});

/**
 * 客户查询参数 DTO
 */
export const ClientQueryDto = z.object({
  /** 关键词搜索 */
  keyword: z.string().optional(),
  /** 页码 */
  page: z.coerce.number().int().positive().optional().default(1),
  /** 每页数量 */
  pageSize: z.coerce.number().int().positive().max(100).optional().default(10)
});

export type CreateClientDtoType = z.infer<typeof CreateClientDto>;
export type UpdateClientDtoType = z.infer<typeof UpdateClientDto>;
export type ClientQueryDtoType = z.infer<typeof ClientQueryDto>;
