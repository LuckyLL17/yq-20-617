import {
  CalculatePerformanceDtoType,
  SavePerformanceSharesDtoType,
  PerformanceQueryDtoType,
  MonthlyReportDtoType
} from '../dtos/performance.dto';
import { performanceShareRepository } from '../repositories/PerformanceShareRepository';
import { caseRepository } from '../repositories/CaseRepository';
import { calculatePerformanceShares, generatePerformanceReport } from '../utils/performanceCalculator';
import { NotFoundError, BadRequestError } from '../common/errors';

/**
 * 绩效服务
 * 处理绩效分成计算、报表等业务逻辑
 */
class PerformanceService {
  /**
   * 计算案件绩效分成
   */
  async calculatePerformance(
    caseId: string,
    calculateDto: CalculatePerformanceDtoType
  ): Promise<any> {
    // 获取案件及其律师分配和时间条目
    const caseItem = await caseRepository.findByIdWithLawyersAndTimeEntries(caseId);
    if (!caseItem) {
      throw new NotFoundError('案件不存在', 'CASE_NOT_FOUND');
    }

    // 计算绩效分成
    const shares = calculatePerformanceShares(
      caseItem.timeEntries as any,
      caseItem.lawyerAssignments as any,
      calculateDto.totalFee
    );

    return shares;
  }

  /**
   * 保存绩效分成
   */
  async savePerformanceShares(
    caseId: string,
    saveDto: SavePerformanceSharesDtoType
  ): Promise<any[]> {
    // 验证案件是否存在
    const caseItem = await caseRepository.findById(caseId);
    if (!caseItem) {
      throw new NotFoundError('案件不存在', 'CASE_NOT_FOUND');
    }

    // 删除旧的绩效分成
    await performanceShareRepository.deleteByCaseId(caseId);

    // 批量创建新的绩效分成
    const shares = saveDto.shares.map((share: any) => ({
      caseId,
      lawyerId: share.lawyerId,
      totalHours: share.totalHours,
      shareRatio: share.shareRatio,
      contribution: share.contribution,
      allocatedFee: share.allocatedFee,
      calculatedAt: new Date()
    }));

    return performanceShareRepository.createManyWithLawyer(shares as any);
  }

  /**
   * 获取案件的绩效分成
   */
  async getCasePerformance(caseId: string): Promise<any[]> {
    // 验证案件是否存在
    const caseItem = await caseRepository.findById(caseId);
    if (!caseItem) {
      throw new NotFoundError('案件不存在', 'CASE_NOT_FOUND');
    }

    return performanceShareRepository.findByCaseId(caseId);
  }

  /**
   * 获取律师的绩效分成
   */
  async getLawyerPerformance(
    lawyerId: string,
    filters: PerformanceQueryDtoType
  ): Promise<any> {
    // 获取律师的绩效分成记录
    const shares = await performanceShareRepository.findByLawyerId(
      lawyerId,
      filters.startDate,
      filters.endDate
    );

    // 计算汇总数据
    const totalFee = shares.reduce((sum: number, s: any) => sum + s.allocatedFee.toNumber(), 0);
    const totalHours = shares.reduce((sum: number, s: any) => sum + s.totalHours.toNumber(), 0);

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
   * 获取月度绩效报表
   */
  async getMonthlyReport(monthlyDto: MonthlyReportDtoType): Promise<any> {
    const { month, year } = monthlyDto;

    // 计算月份的开始和结束日期
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // 获取该月份的所有绩效分成
    const shares = await performanceShareRepository.findByDateRange(startDate, endDate);

    // 生成报表
    const report = generatePerformanceReport(shares as any, { start: startDate, end: endDate });

    return report;
  }

  /**
   * 获取律师绩效排名
   */
  async getLawyerRanking(filters: PerformanceQueryDtoType): Promise<any[]> {
    const { startDate, endDate, limit = 10 } = filters;

    const where: any = {};
    if (startDate && endDate) {
      where.calculatedAt = {
        gte: startDate,
        lte: endDate
      };
    }

    // 获取所有绩效分成
    const shares = await performanceShareRepository.findMany(
      where,
      { lawyer: { select: { id: true, name: true } } }
    );

    // 按律师统计
    const lawyerStats = new Map<string, any>();

    for (const share of shares as any[]) {
      const existing = lawyerStats.get(share.lawyerId) || {
        lawyerId: share.lawyerId,
        lawyerName: share.lawyer?.name || '未知',
        totalCases: 0,
        totalHours: 0,
        totalFee: 0
      };

      existing.totalCases += 1;
      existing.totalHours += share.totalHours.toNumber();
      existing.totalFee += share.allocatedFee.toNumber();

      lawyerStats.set(share.lawyerId, existing);
    }

    // 排序并取前 N 名
    const ranking = Array.from(lawyerStats.values())
      .sort((a, b) => b.totalFee - a.totalFee)
      .slice(0, Number(limit))
      .map((item, index) => ({
        rank: index + 1,
        ...item,
        averageHourlyRate: item.totalHours > 0 ? item.totalFee / item.totalHours : 0
      }));

    return ranking;
  }
}

export const performanceService = new PerformanceService();
