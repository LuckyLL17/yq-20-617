import { z } from 'zod';
import { FeeType, PaymentStatus } from '@prisma/client';

export const invoiceItemDto = z.object({
  description: z.string().min(1, '项目描述不能为空'),
  feeType: z.nativeEnum(FeeType, { errorMap: () => ({ message: '无效的费用类型' }) }).optional().default(FeeType.LEGAL_FEE),
  quantity: z.number().positive().optional().default(1),
  unitPrice: z.number().positive().optional(),
  amount: z.number().positive('金额必须为正数')
});

export type InvoiceItemDto = z.infer<typeof invoiceItemDto>;

export const createInvoiceDto = z.object({
  caseId: z.string().min(1, '案件ID不能为空'),
  items: z.array(invoiceItemDto).min(1, '至少需要一个发票项目'),
  dueDate: z.string().optional(),
  notes: z.string().optional()
});

export type CreateInvoiceDto = z.infer<typeof createInvoiceDto>;

export const createPaymentDto = z.object({
  amount: z.number().positive('金额必须为正数'),
  paymentDate: z.string().min(1, '支付日期不能为空'),
  paymentMethod: z.string().min(1, '支付方式不能为空'),
  payer: z.string().optional(),
  notes: z.string().optional()
});

export type CreatePaymentDto = z.infer<typeof createPaymentDto>;

export const updateInvoiceStatusDto = z.object({
  status: z.nativeEnum(PaymentStatus, { errorMap: () => ({ message: '无效的支付状态' }) })
});

export type UpdateInvoiceStatusDto = z.infer<typeof updateInvoiceStatusDto>;

export const calculateBillingDto = z.object({
  caseId: z.string().min(1, '案件ID不能为空'),
  billingConfig: z.object({
    mode: z.enum(['HOURLY', 'FIXED', 'CONTINGENCY', 'PROGRESSIVE', 'MIXED']),
    hourlyRate: z.number().positive().optional(),
    fixedFee: z.number().positive().optional(),
    contingencyRate: z.number().min(0).max(100).optional(),
    progressiveTiers: z.array(z.object({
      minAmount: z.number(),
      maxAmount: z.number(),
      rate: z.number()
    })).optional(),
    mixedConfig: z.object({
      baseFee: z.number(),
      hourlyRate: z.number(),
      includedHours: z.number(),
      contingencyRate: z.number().optional()
    }).optional()
  })
});

export type CalculateBillingDto = z.infer<typeof calculateBillingDto>;

export const billingQueryDto = z.object({
  status: z.nativeEnum(PaymentStatus).optional(),
  caseId: z.string().optional()
});

export type BillingQueryDto = z.infer<typeof billingQueryDto>;

export const reportQueryDto = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export type ReportQueryDto = z.infer<typeof reportQueryDto>;
