import { z } from 'zod';

/**
 * 绩效计算请求 DTO
 */
export const calculatePerformanceDto = z.object({
  totalFee: z.number().positive('总费用必须为正数')
});

export type CalculatePerformanceDto = z.infer<typeof calculatePerformanceDto>;

/**
 * 绩效分成保存 DTO
 */
const performanceShareItemDto = z.object({
  lawyerId: z.string().min(1, '律师ID不能为空'),
  totalHours: z.number().min(0, '总工时不能为负数'),
  shareRatio: z.number().min(0, '分成比例不能为负数'),
  contribution: z.number().min(0, '贡献度不能为负数'),
  allocatedFee: z.number().min(0, '分配费用不能为负数')
});

export const savePerformanceSharesDto = z.object({
  shares: z.array(performanceShareItemDto).min(1, '至少需要一条分成记录')
});

export type SavePerformanceSharesDto = z.infer<typeof savePerformanceSharesDto>;

/**
 * 律师绩效查询参数 DTO
 */
export const lawyerPerformanceQueryDto = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export type LawyerPerformanceQueryDto = z.infer<typeof lawyerPerformanceQueryDto>;

/**
 * 月度报告查询参数 DTO
 */
export const monthlyReportQueryDto = z.object({
  month: z.string().min(1, '月份不能为空'),
  year: z.string().min(1, '年份不能为空')
});

export type MonthlyReportQueryDto = z.infer<typeof monthlyReportQueryDto>;

/**
 * 排名报告查询参数 DTO
 */
export const rankingReportQueryDto = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().positive('排名数量必须为正数').optional()
});

export type RankingReportQueryDto = z.infer<typeof rankingReportQueryDto>;
