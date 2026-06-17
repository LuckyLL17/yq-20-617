import { z } from 'zod';

/**
 * 计算绩效 DTO
 */
export const CalculatePerformanceDto = z.object({
  /** 总费用 */
  totalFee: z.number().positive({ message: '总费用必须为正数' })
});

/**
 * 保存绩效分成 DTO
 */
export const SavePerformanceSharesDto = z.object({
  /** 分成列表 */
  shares: z.array(
    z.object({
      /** 律师ID */
      lawyerId: z.string().min(1, { message: '律师ID不能为空' }),
      /** 总工时 */
      totalHours: z.number().nonnegative({ message: '工时不能为负数' }),
      /** 分成比例 */
      shareRatio: z.number().nonnegative({ message: '分成比例不能为负数' }),
      /** 贡献度 */
      contribution: z.number().nonnegative({ message: '贡献度不能为负数' }),
      /** 分配费用 */
      allocatedFee: z.number().nonnegative({ message: '分配费用不能为负数' })
    })
  )
});

/**
 * 绩效查询参数 DTO
 */
export const PerformanceQueryDto = z.object({
  /** 开始日期 */
  startDate: z.coerce.date().optional(),
  /** 结束日期 */
  endDate: z.coerce.date().optional(),
  /** 限制数量 */
  limit: z.coerce.number().int().positive().max(100).optional().default(10)
});

/**
 * 月度报表查询 DTO
 */
export const MonthlyReportDto = z.object({
  /** 月份（1-12） */
  month: z.coerce.number().int().min(1).max(12, { message: '月份必须在1-12之间' }),
  /** 年份 */
  year: z.coerce.number().int().positive({ message: '年份无效' })
});

export type CalculatePerformanceDtoType = z.infer<typeof CalculatePerformanceDto>;
export type SavePerformanceSharesDtoType = z.infer<typeof SavePerformanceSharesDto>;
export type PerformanceQueryDtoType = z.infer<typeof PerformanceQueryDto>;
export type MonthlyReportDtoType = z.infer<typeof MonthlyReportDto>;
