/**
 * 账单模块 DTO
 * 定义账单相关请求的验证规则
 */

import { z } from 'zod';
import { FeeType, PaymentStatus, BillingMode } from '@prisma/client';

/**
 * 发票查询参数 DTO
 */
export const invoiceQueryDto = z.object({
  status: z.nativeEnum(PaymentStatus).optional(),
  caseId: z.string().optional()
});

export type InvoiceQueryDto = z.infer<typeof invoiceQueryDto>;

/**
 * 计费计算请求 DTO
 */
export const calculateBillingDto = z.object({
  caseId: z.string().min(1, '案件ID不能为空'),
  billingConfig: z.object({
    mode: z.nativeEnum(BillingMode, { message: '收费模式无效' }),
    hourlyRate: z.number().nonnegative().optional(),
    fixedFee: z.number().nonnegative().optional(),
    contingencyRate: z.number().min(0).max(100).optional(),
    progressiveTiers: z.array(
      z.object({
        minAmount: z.number().nonnegative(),
        maxAmount: z.number().nonnegative(),
        rate: z.number().min(0).max(100)
      })
    ).optional(),
    mixedConfig: z.object({
      baseFee: z.number().nonnegative(),
      hourlyRate: z.number().nonnegative(),
      includedHours: z.number().nonnegative(),
      contingencyRate: z.number().min(0).max(100).optional()
    }).optional()
  })
});

export type CalculateBillingDto = z.infer<typeof calculateBillingDto>;

/**
 * 发票项目 DTO
 */
const invoiceItemDto = z.object({
  description: z.string().min(1, '项目描述不能为空'),
  feeType: z.nativeEnum(FeeType).default(FeeType.LEGAL_FEE),
  quantity: z.number().positive('数量必须为正数').default(1),
  unitPrice: z.number().nonnegative('单价不能为负数').default(0),
  amount: z.number().nonnegative('金额不能为负数')
});

/**
 * 创建发票请求 DTO
 */
export const createInvoiceDto = z.object({
  caseId: z.string().min(1, '案件ID不能为空'),
  items: z.array(invoiceItemDto).min(1, '至少需要一个发票项目'),
  dueDate: z.string().optional(),
  notes: z.string().optional()
});

export type CreateInvoiceDto = z.infer<typeof createInvoiceDto>;

/**
 * 创建付款请求 DTO
 */
export const createPaymentDto = z.object({
  amount: z.number().positive('付款金额必须为正数'),
  paymentDate: z.string().min(1, '付款日期不能为空'),
  paymentMethod: z.string().min(1, '付款方式不能为空'),
  payer: z.string().optional(),
  notes: z.string().optional()
});

export type CreatePaymentDto = z.infer<typeof createPaymentDto>;

/**
 * 更新发票状态 DTO
 */
export const updateInvoiceStatusDto = z.object({
  status: z.nativeEnum(PaymentStatus, { message: '付款状态无效' })
});

export type UpdateInvoiceStatusDto = z.infer<typeof updateInvoiceStatusDto>;

/**
 * 账单报告查询参数 DTO
 */
export const billingReportQueryDto = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export type BillingReportQueryDto = z.infer<typeof billingReportQueryDto>;
