import { z } from 'zod';

export const calculatePerformanceDto = z.object({
  totalFee: z.number().positive('总费用必须为正数')
});

export type CalculatePerformanceDto = z.infer<typeof calculatePerformanceDto>;

export const savePerformanceSharesDto = z.object({
  shares: z.array(z.object({
    lawyerId: z.string().min(1, '律师ID不能为空'),
    totalHours: z.number().positive(),
    shareRatio: z.number().min(0).max(1),
    contribution: z.number().min(0).max(1),
    allocatedFee: z.number().positive()
  })).min(1, '至少需要一条绩效分配记录')
});

export type SavePerformanceSharesDto = z.infer<typeof savePerformanceSharesDto>;

export const lawyerPerformanceQueryDto = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export type LawyerPerformanceQueryDto = z.infer<typeof lawyerPerformanceQueryDto>;

export const monthlyReportQueryDto = z.object({
  month: z.string().min(1, '月份不能为空'),
  year: z.string().min(1, '年份不能为空')
});

export type MonthlyReportQueryDto = z.infer<typeof monthlyReportQueryDto>;

export const rankingQueryDto = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.string().optional().default('10')
});

export type RankingQueryDto = z.infer<typeof rankingQueryDto>;
