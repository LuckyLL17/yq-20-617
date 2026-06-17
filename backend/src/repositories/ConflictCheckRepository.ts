import { ConflictCheck, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

/**
 * 利益冲突检查数据访问层
 */
class ConflictCheckRepository extends BaseRepository<ConflictCheck, Prisma.ConflictCheckCreateInput, Prisma.ConflictCheckUpdateInput> {
  constructor() {
    super('ConflictCheck');
  }

  protected get model() {
    return this.prisma.conflictCheck;
  }

  /**
   * 获取案件的冲突检查记录
   */
  async findByCaseId(caseId: string): Promise<ConflictCheck | null> {
    return this.model.findUnique({
      where: { caseId }
    });
  }
}

export const conflictCheckRepository = new ConflictCheckRepository();
