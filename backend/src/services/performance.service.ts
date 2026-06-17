import { PerformanceRepository } from '../repositories/performance.repository';
import { CaseRepository } from '../repositories/case.repository';
import { NotFoundError } from '../types/errors';
import { calculatePerformanceShares, generatePerformanceReport } from '../utils/performanceCalculator';
import { CalculatePerformanceDto, SavePerformanceSharesDto } from '../dto/performance.dto';

const performanceRepo = new PerformanceRepository();
const caseRepo = new CaseRepository();

export class PerformanceService {
  async calculateShares(caseId: string, dto: CalculatePerformanceDto) {
    const caseItem = await caseRepo.findByIdWithAssignments(caseId);
    if (!caseItem) {
      throw new NotFoundError('案件不存在');
    }

    return calculatePerformanceShares(
      caseItem.timeEntries,
      caseItem.lawyerAssignments,
      dto.totalFee
    );
  }

  async saveShares(caseId: string, dto: SavePerformanceSharesDto) {
    await performanceRepo.deleteSharesByCase(caseId);

    const savedShares = await Promise.all(
      dto.shares.map(share =>
        performanceRepo.createShare({
          caseId,
          lawyerId: share.lawyerId,
          totalHours: share.totalHours,
          shareRatio: share.shareRatio,
          contribution: share.contribution,
          allocatedFee: share.allocatedFee,
          calculatedAt: new Date()
        })
      )
    );

    return savedShares;
  }

  async findSharesByCase(caseId: string) {
    return performanceRepo.findSharesByCase(caseId);
  }

  async findSharesByLawyer(lawyerId: string, query: any) {
    const where: any = { lawyerId };

    if (query.startDate && query.endDate) {
      where.calculatedAt = {
        gte: new Date(query.startDate as string),
        lte: new Date(query.endDate as string)
      };
    }

    const shares = await performanceRepo.findSharesByLawyer(where);

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

  async getMonthlyReport(query: any) {
    const startDate = new Date(Number(query.year), Number(query.month) - 1, 1);
    const endDate = new Date(Number(query.year), Number(query.month), 0);

    const shares = await performanceRepo.findSharesForReport({
      calculatedAt: { gte: startDate, lte: endDate }
    });

    return generatePerformanceReport(shares as any, { start: startDate, end: endDate });
  }

  async getRanking(query: any) {
    const where: any = {};
    if (query.startDate && query.endDate) {
      where.calculatedAt = {
        gte: new Date(query.startDate as string),
        lte: new Date(query.endDate as string)
      };
    }

    const shares = await performanceRepo.findSharesForReport(where);

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

    const limit = Number(query.limit) || 10;

    return Array.from(lawyerStats.values())
      .sort((a, b) => b.totalFee - a.totalFee)
      .slice(0, limit)
      .map((item, index) => ({
        rank: index + 1,
        ...item,
        averageHourlyRate: item.totalHours > 0 ? item.totalFee / item.totalHours : 0
      }));
  }
}
