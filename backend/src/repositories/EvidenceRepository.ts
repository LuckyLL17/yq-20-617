import { Evidence, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

/**
 * 证据数据访问层
 */
class EvidenceRepository extends BaseRepository<Evidence, Prisma.EvidenceCreateInput, Prisma.EvidenceUpdateInput> {
  constructor() {
    super('Evidence');
  }

  protected get model() {
    return this.prisma.evidence;
  }

  /**
   * 获取案件的证据列表
   */
  async findByCaseId(caseId: string): Promise<Evidence[]> {
    return this.model.findMany({
      where: { caseId },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const evidenceRepository = new EvidenceRepository();
