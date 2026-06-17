import { PerformanceShare, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

/**
 * 绩效分成数据访问层
 */
class PerformanceShareRepository extends BaseRepository<PerformanceShare, Prisma.PerformanceShareCreateInput, Prisma.PerformanceShareUpdateInput> {
  constructor() {
    super('PerformanceShare');
  }

  protected get model() {
    return this.prisma.performanceShare;
  }

  /**
   * 获取案件的绩效分成列表
   */
  async findByCaseId(caseId: string): Promise<PerformanceShare[]> {
    return this.model.findMany({
      where: { caseId },
      include: { lawyer: { select: { id: true, name: true } } },
      orderBy: { shareRatio: 'desc' }
    });
  }

  /**
   * 获取律师的绩效分成列表
   */
  async findByLawyerId(
    lawyerId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<PerformanceShare[]> {
    const where: any = { lawyerId };
    if (startDate && endDate) {
      where.calculatedAt = {
        gte: startDate,
        lte: endDate
      };
    }
    return this.model.findMany({
      where,
      include: {
        caseItem: { select: { id: true, caseNumber: true, title: true } }
      },
      orderBy: { calculatedAt: 'desc' }
    });
  }

  /**
   * 删除案件的所有绩效分成
   */
  async deleteByCaseId(caseId: string): Promise<{ count: number }> {
    return this.model.deleteMany({
      where: { caseId }
    });
  }

  /**
   * 批量创建绩效分成
   */
  async createManyWithLawyer(
    shares: Prisma.PerformanceShareCreateManyInput[]
  ): Promise<PerformanceShare[]> {
    const created: PerformanceShare[] = [];
    for (const share of shares) {
      const createdShare = await this.model.create({
        data: share,
        include: { lawyer: { select: { id: true, name: true } } }
      });
      created.push(createdShare);
    }
    return created;
  }

  /**
   * 获取指定日期范围内的所有绩效分成
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<PerformanceShare[]> {
    return this.model.findMany({
      where: {
        calculatedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: { lawyer: { select: { id: true, name: true } } }
    });
  }
}

export const performanceShareRepository = new PerformanceShareRepository();
