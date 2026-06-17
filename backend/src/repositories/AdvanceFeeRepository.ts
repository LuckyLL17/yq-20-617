import { AdvanceFee, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

/**
 * 预付费/垫付款数据访问层
 */
class AdvanceFeeRepository extends BaseRepository<AdvanceFee, Prisma.AdvanceFeeCreateInput, Prisma.AdvanceFeeUpdateInput> {
  constructor() {
    super('AdvanceFee');
  }

  protected get model() {
    return this.prisma.advanceFee;
  }

  /**
   * 获取案件的预付费列表
   */
  async findByCaseId(caseId: string): Promise<AdvanceFee[]> {
    return this.model.findMany({
      where: { caseId },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const advanceFeeRepository = new AdvanceFeeRepository();
