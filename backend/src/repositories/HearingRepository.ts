import { Hearing, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

/**
 * 庭审数据访问层
 */
class HearingRepository extends BaseRepository<Hearing, Prisma.HearingCreateInput, Prisma.HearingUpdateInput> {
  constructor() {
    super('Hearing');
  }

  protected get model() {
    return this.prisma.hearing;
  }

  /**
   * 获取案件的庭审列表
   */
  async findByCaseId(caseId: string): Promise<Hearing[]> {
    return this.model.findMany({
      where: { caseId },
      orderBy: { date: 'asc' }
    });
  }
}

export const hearingRepository = new HearingRepository();
