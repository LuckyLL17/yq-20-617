import { z } from 'zod';
import { FeeType, PaymentStatus, BillingMode } from '@prisma/client';

/**
 * 发票明细项 DTO
 */
export const InvoiceItemDto = z.object({
  /** 描述 */
  description: z.string().min(1, { message: '描述不能为空' }),
  /** 费用类型 */
  feeType: z.nativeEnum(FeeType).optional().default(FeeType.LEGAL_FEE),
  /** 数量 */
  quantity: z.number().positive({ message: '数量必须为正数' }).optional().default(1),
  /** 单价 */
  unitPrice: z.number().positive({ message: '单价必须为正数' }),
  /** 金额 */
  amount: z.number().positive({ message: '金额必须为正数' })
});

/**
 * 创建发票 DTO
 */
export const CreateInvoiceDto = z.object({
  /** 案件ID */
  caseId: z.string().min(1, { message: '案件ID不能为空' }),
  /** 发票明细 */
  items: z.array(InvoiceItemDto).min(1, { message: '至少需要一条明细' }),
  /** 到期日 */
  dueDate: z.coerce.date().optional(),
  /** 备注 */
  notes: z.string().optional()
});

/**
 * 创建付款 DTO
 */
export const CreatePaymentDto = z.object({
  /** 金额 */
  amount: z.number().positive({ message: '金额必须为正数' }),
  /** 付款日期 */
  paymentDate: z.coerce.date({ message: '付款日期格式不正确' }),
  /** 付款方式 */
  paymentMethod: z.string().min(1, { message: '付款方式不能为空' }),
  /** 付款人 */
  payer: z.string().optional(),
  /** 备注 */
  notes: z.string().optional()
});

/**
 * 更新发票状态 DTO
 */
export const UpdateInvoiceStatusDto = z.object({
  /** 状态 */
  status: z.nativeEnum(PaymentStatus, { message: '状态无效' })
});

/**
 * 计费计算 DTO
 */
export const CalculateBillingDto = z.object({
  /** 案件ID */
  caseId: z.string().min(1, { message: '案件ID不能为空' }),
  /** 计费配置 */
  billingConfig: z.object({
    /** 计费模式 */
    mode: z.nativeEnum(BillingMode),
    /** 小时费率 */
    hourlyRate: z.number().positive().optional(),
    /** 固定费用 */
    fixedFee: z.number().positive().optional(),
    /** 风险代理费率 */
    contingencyRate: z.number().positive().optional(),
    /** 分段计费档位 */
    progressiveTiers: z.array(
      z.object({
        minAmount: z.number(),
        maxAmount: z.number(),
        rate: z.number()
      })
    ).optional(),
    /** 混合计费配置 */
    mixedConfig: z.object({
      baseFee: z.number().positive(),
      hourlyRate: z.number().positive(),
      includedHours: z.number().positive(),
      contingencyRate: z.number().positive().optional()
    }).optional()
  })
});

/**
 * 发票查询参数 DTO
 */
export const InvoiceQueryDto = z.object({
  /** 状态过滤 */
  status: z.nativeEnum(PaymentStatus).optional(),
  /** 案件ID过滤 */
  caseId: z.string().optional(),
  /** 开始日期 */
  startDate: z.coerce.date().optional(),
  /** 结束日期 */
  endDate: z.coerce.date().optional(),
  /** 页码 */
  page: z.coerce.number().int().positive().optional().default(1),
  /** 每页数量 */
  pageSize: z.coerce.number().int().positive().max(100).optional().default(10)
});

/**
 * 财务报表查询 DTO
 */
export const BillingReportQueryDto = z.object({
  /** 开始日期 */
  startDate: z.coerce.date().optional(),
  /** 结束日期 */
  endDate: z.coerce.date().optional()
});

export type InvoiceItemDtoType = z.infer<typeof InvoiceItemDto>;
export type CreateInvoiceDtoType = z.infer<typeof CreateInvoiceDto>;
export type CreatePaymentDtoType = z.infer<typeof CreatePaymentDto>;
export type UpdateInvoiceStatusDtoType = z.infer<typeof UpdateInvoiceStatusDto>;
export type CalculateBillingDtoType = z.infer<typeof CalculateBillingDto>;
export type InvoiceQueryDtoType = z.infer<typeof InvoiceQueryDto>;
export type BillingReportQueryDtoType = z.infer<typeof BillingReportQueryDto>;
