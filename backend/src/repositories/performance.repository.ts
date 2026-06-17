import { prisma } from '../config/prisma';
import { PerformanceShare } from '@prisma/client';
import { SavePerformanceSharesDto, LawyerPerformanceQueryDto, MonthlyReportQueryDto, RankingReportQueryDto } from '../dtos/performance.dto';
import { Prisma } from '@prisma/client';
import { generatePerformanceReport } from '../utils/performanceCalculator';

/**
 * 绩效数据访问层
 * 封装所有绩效相关的数据库操作
 */
export class PerformanceRepository {
  /**
   * 绩效分成列表关联字段
   */
  private shareInclude = {
    lawyer: { select: { id: true, name: true } }
  };

  /**
   * 计算案件绩效分成
   * @param caseId 案件ID
   */
  async getCaseWithTimeAndLawyers(caseId: string): Promise<any> {
    return prisma.legalCase.findUnique({
      where: { id: caseId },
      include: {
        timeEntries: true,
        lawyerAssignments: {
          include: { lawyer: { select: { id: true, name: true } } }
        }
      }
    });
  }

  /**
   * 保存绩效分成
   * @param caseId 案件ID
   * @param data 分成数据
   */
  async saveShares(caseId: string, data: SavePerformanceSharesDto): Promise<any[]> {
    await prisma.performanceShare.deleteMany({
      where: { caseId }
    });

    const savedShares = await Promise.all(
      data.shares.map(share =>
        prisma.performanceShare.create({
          data: {
            caseId,
            lawyerId: share.lawyerId,
            totalHours: share.totalHours,
            shareRatio: share.shareRatio,
            contribution: share.contribution,
            allocatedFee: share.allocatedFee,
            calculatedAt: new Date()
          },
          include: this.shareInclude
        })
      )
    );

    return savedShares;
  }

  /**
   * 获取案件的绩效分成
   * @param caseId 案件ID
   */
  async getSharesByCaseId(caseId: string): Promise<any[]> {
    return prisma.performanceShare.findMany({
      where: { caseId },
      include: this.shareInclude,
      orderBy: { shareRatio: 'desc' }
    });
  }

  /**
   * 获取律师的绩效记录
   * @param lawyerId 律师ID
   * @param query 查询参数
   */
  async getSharesByLawyerId(lawyerId: string, query: LawyerPerformanceQueryDto = {}): Promise<any> {
    const where: Prisma.PerformanceShareWhereInput = { lawyerId };
    
    if (query.startDate && query.endDate) {
      where.calculatedAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate)
      };
    }

    const shares = await prisma.performanceShare.findMany({
      where,
      include: {
        caseItem: { select: { id: true, caseNumber: true, title: true } }
      },
      orderBy: { calculatedAt: 'desc' }
    });

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
   * @param query 查询参数
   */
  async getMonthlyReport(query: MonthlyReportQueryDto): Promise<any> {
    const startDate = new Date(Number(query.year), Number(query.month) - 1, 1);
    const endDate = new Date(Number(query.year), Number(query.month), 0);

    const shares = await prisma.performanceShare.findMany({
      where: {
        calculatedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: this.shareInclude
    });

    return generatePerformanceReport(shares as any, { start: startDate, end: endDate });
  }

  /**
   * 获取律师绩效排名
   * @param query 查询参数
   */
  async getRanking(query: RankingReportQueryDto): Promise<any[]> {
    const where: Prisma.PerformanceShareWhereInput = {};
    
    if (query.startDate && query.endDate) {
      where.calculatedAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate)
      };
    }

    const shares = await prisma.performanceShare.findMany({
      where,
      include: this.shareInclude
    });

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

    const limit = query.limit || 10;
    const ranking = Array.from(lawyerStats.values())
      .sort((a, b) => b.totalFee - a.totalFee)
      .slice(0, limit)
      .map((item, index) => ({
        rank: index + 1,
        ...item,
        averageHourlyRate: item.totalHours > 0 ? item.totalFee / item.totalHours : 0
      }));

    return ranking;
  }

  /**
   * 检查案件是否存在
   * @param caseId 案件ID
   */
  async caseExists(caseId: string): Promise<boolean> {
    const count = await prisma.legalCase.count({
      where: { id: caseId }
    });
    return count > 0;
  }
}

export const performanceRepository = new PerformanceRepository();
