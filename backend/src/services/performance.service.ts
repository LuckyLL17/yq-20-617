/**
 * 绩效服务
 * 处理绩效相关的业务逻辑
 */

import { performanceRepository } from '../repositories/performance.repository';
import { caseRepository } from '../repositories/case.repository';
import { NotFoundError } from '../common/errors';
import {
  CalculatePerformanceDto,
  SavePerformanceSharesDto,
  LawyerPerformanceQueryDto,
  MonthlyReportQueryDto,
  RankingQueryDto
} from '../dto/performance.dto';
import {
  calculatePerformanceShares,
  generatePerformanceReport
} from '../utils/performanceCalculator';
import { Prisma } from '@prisma/client';

export class PerformanceService {
  /**
   * 计算绩效分成
   */
  async calculatePerformance(caseId: string, calculatePerformanceDto: CalculatePerformanceDto) {
    const caseItem = await caseRepository.findById(caseId);
    if (!caseItem) {
      throw new NotFoundError('案件不存在');
    }

    const timeEntries = await caseRepository.getTimeEntries(caseId);
    const lawyerAssignments = await caseRepository.getLawyerAssignments(caseId);

    return calculatePerformanceShares(
      timeEntries as any,
      lawyerAssignments as any,
      calculatePerformanceDto.totalFee
    );
  }

  /**
   * 保存绩效分成
   */
  async savePerformanceShares(caseId: string, saveSharesDto: SavePerformanceSharesDto) {
    const caseItem = await caseRepository.findById(caseId);
    if (!caseItem) {
      throw new NotFoundError('案件不存在');
    }

    return performanceRepository.saveShares(caseId, saveSharesDto.shares);
  }

  /**
   * 获取案件的绩效分成
   */
  async getCasePerformance(caseId: string) {
    const caseItem = await caseRepository.findById(caseId);
    if (!caseItem) {
      throw new NotFoundError('案件不存在');
    }

    return performanceRepository.getSharesByCaseId(caseId);
  }

  /**
   * 获取律师的绩效
   */
  async getLawyerPerformance(lawyerId: string, query: LawyerPerformanceQueryDto) {
    const where: Prisma.PerformanceShareWhereInput = {};
    if (query.startDate && query.endDate) {
      where.calculatedAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate)
      };
    }

    const shares = await performanceRepository.getSharesByLawyerId(lawyerId, where);

    const totalFee = shares.reduce((sum, s) => sum + s.allocatedFee.toNumber(), 0);
    const totalHours = shares.reduce((sum, s) => sum + s.totalHours.toNumber(), 0);

    return {
      shares,
      summary: {
        totalCases: shares.length,
        totalFee,
        totalHours,
        averageHourlyRate: totalHours > 0 ? totalFee / totalHours : 0
      }
    };
  }

  /**
   * 获取月度绩效报告
   */
  async getMonthlyReport(query: MonthlyReportQueryDto) {
    const startDate = new Date(Number(query.year), Number(query.month) - 1, 1);
    const endDate = new Date(Number(query.year), Number(query.month), 0);

    const shares = await performanceRepository.getMonthlyShares(startDate, endDate);

    return generatePerformanceReport(shares as any, { start: startDate, end: endDate });
  }

  /**
   * 获取绩效排名
   */
  async getPerformanceRanking(query: RankingQueryDto) {
    const where: Prisma.PerformanceShareWhereInput = {};
    if (query.startDate && query.endDate) {
      where.calculatedAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate)
      };
    }

    const shares = await performanceRepository.getPerformanceRanking(where);

    const lawyerStats = new Map<string, any>();

    for (const share of shares) {
      const existing = lawyerStats.get(share.lawyerId) || {
        lawyerId: share.lawyerId,
        lawyerName: (share.lawyer as any).name,
        totalCases: 0,
        totalHours: 0,
        totalFee: 0
      };

      existing.totalCases += 1;
      existing.totalHours += share.totalHours.toNumber();
      existing.totalFee += share.allocatedFee.toNumber();

      lawyerStats.set(share.lawyerId, existing);
    }

    const ranking = Array.from(lawyerStats.values())
      .sort((a, b) => b.totalFee - a.totalFee)
      .slice(0, Number(query.limit))
      .map((item, index) => ({
        rank: index + 1,
        ...item,
        averageHourlyRate: item.totalHours > 0 ? item.totalFee / item.totalHours : 0
      }));

    return ranking;
  }
}

export const performanceService = new PerformanceService();
