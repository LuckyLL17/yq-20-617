import { prisma } from './prisma';

export class PerformanceRepository {
  async deleteSharesByCase(caseId: string) {
    return prisma.performanceShare.deleteMany({ where: { caseId } });
  }

  async createShare(data: any) {
    return prisma.performanceShare.create({
      data,
      include: { lawyer: { select: { id: true, name: true } } }
    });
  }

  async findSharesByCase(caseId: string) {
    return prisma.performanceShare.findMany({
      where: { caseId },
      include: { lawyer: { select: { id: true, name: true } } },
      orderBy: { shareRatio: 'desc' }
    });
  }

  async findSharesByLawyer(where: any) {
    return prisma.performanceShare.findMany({
      where,
      include: {
        caseItem: { select: { id: true, caseNumber: true, title: true } }
      },
      orderBy: { calculatedAt: 'desc' }
    });
  }

  async findSharesForReport(where: any) {
    return prisma.performanceShare.findMany({
      where,
      include: { lawyer: { select: { id: true, name: true } } }
    });
  }
}
