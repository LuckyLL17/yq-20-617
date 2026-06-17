import { z } from 'zod';
import { PaymentStatus, FeeType, BillingMode } from '@prisma/client';

/**
 * 发票查询参数 DTO
 */
export const invoiceQueryDto = z.object({
  status: z.nativeEnum(PaymentStatus).optional(),
  caseId: z.string().optional()
});

export type InvoiceQueryDto = z.infer<typeof invoiceQueryDto>;

/**
 * 发票项目 DTO
 */
const invoiceItemDto = z.object({
  description: z.string().min(1, '项目描述不能为空'),
  feeType: z.nativeEnum(FeeType).optional(),
  quantity: z.number().positive('数量必须为正数').optional(),
  unitPrice: z.number().positive('单价必须为正数').optional(),
  amount: z.number().positive('金额必须为正数')
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
 * 支付创建请求 DTO
 */
export const createPaymentDto = z.object({
  amount: z.number().positive('支付金额必须为正数'),
  paymentDate: z.string().min(1, '支付日期不能为空'),
  paymentMethod: z.string().min(1, '支付方式不能为空'),
  payer: z.string().optional(),
  notes: z.string().optional()
});

export type CreatePaymentDto = z.infer<typeof createPaymentDto>;

/**
 * 发票状态更新请求 DTO
 */
export const updateInvoiceStatusDto = z.object({
  status: z.nativeEnum(PaymentStatus, { message: '状态无效' })
});

export type UpdateInvoiceStatusDto = z.infer<typeof updateInvoiceStatusDto>;

/**
 * 计费计算请求 DTO
 */
export const calculateBillingDto = z.object({
  caseId: z.string().min(1, '案件ID不能为空'),
  billingConfig: z.object({
    billingMode: z.nativeEnum(BillingMode),
    hourlyRate: z.number().positive('时费率必须为正数').optional(),
    fixedFee: z.number().positive('固定费用必须为正数').optional(),
    contingencyRate: z.number().min(0).max(100, '风险代理比例应在0-100之间').optional(),
    progressiveTiers: z.array(
      z.object({
        min: z.number().min(0),
        max: z.number().optional(),
        rate: z.number().min(0).max(100)
      })
    ).optional()
  })
});

export type CalculateBillingDto = z.infer<typeof calculateBillingDto>;

/**
 * 财务概览报告查询参数 DTO
 */
export const billingOverviewQueryDto = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export type BillingOverviewQueryDto = z.infer<typeof billingOverviewQueryDto>;
