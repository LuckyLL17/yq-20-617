/**
 * 绩效数据访问层
 * 封装所有绩效相关的数据库操作
 */

import { prisma } from '../common/prisma';
import { PerformanceShare, Prisma } from '@prisma/client';

export class PerformanceRepository {
  /**
   * 获取案件的绩效分成
   */
  async getSharesByCaseId(caseId: string) {
    return prisma.performanceShare.findMany({
      where: { caseId },
      include: { lawyer: { select: { id: true, name: true } } },
      orderBy: { shareRatio: 'desc' }
    });
  }

  /**
   * 获取律师的绩效分成
   */
  async getSharesByLawyerId(lawyerId: string, where?: Prisma.PerformanceShareWhereInput) {
    return prisma.performanceShare.findMany({
      where: {
        lawyerId,
        ...where
      },
      include: {
        caseItem: { select: { id: true, caseNumber: true, title: true } }
      },
      orderBy: { calculatedAt: 'desc' }
    });
  }

  /**
   * 保存绩效分成（先删除再创建）
   */
  async saveShares(
    caseId: string,
    shares: Array<{
      lawyerId: string;
      totalHours: number | Prisma.Decimal;
      shareRatio: number | Prisma.Decimal;
      contribution: number | Prisma.Decimal;
      allocatedFee: number | Prisma.Decimal;
    }>
  ) {
    // 删除旧记录
    await prisma.performanceShare.deleteMany({
      where: { caseId }
    });

    // 批量创建新记录
    const savedShares = await Promise.all(
      shares.map(share =>
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
          include: { lawyer: { select: { id: true, name: true } } }
        })
      )
    );

    return savedShares;
  }

  /**
   * 获取月度绩效分成
   */
  async getMonthlyShares(startDate: Date, endDate: Date) {
    return prisma.performanceShare.findMany({
      where: {
        calculatedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: { lawyer: { select: { id: true, name: true } } }
    });
  }

  /**
   * 获取绩效排名
   */
  async getPerformanceRanking(where?: Prisma.PerformanceShareWhereInput) {
    return prisma.performanceShare.findMany({
      where,
      include: { lawyer: { select: { id: true, name: true } } }
    });
  }
}

export const performanceRepository = new PerformanceRepository();
