import { StageHistory, Prisma, CaseStage } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

/**
 * 阶段历史数据访问层
 */
class StageHistoryRepository extends BaseRepository<StageHistory, Prisma.StageHistoryCreateInput, Prisma.StageHistoryUpdateInput> {
  constructor() {
    super('StageHistory');
  }

  protected get model() {
    return this.prisma.stageHistory;
  }

  /**
   * 结束案件当前阶段（更新 endedAt）
   */
  async endCurrentStage(caseId: string): Promise<{ count: number }> {
    return this.model.updateMany({
      where: { caseId, endedAt: null },
      data: { endedAt: new Date() }
    });
  }

  /**
   * 创建新阶段历史记录
   */
  async createStage(
    caseId: string,
    stage: CaseStage,
    operatorId: string,
    notes?: string
  ): Promise<StageHistory> {
    return this.model.create({
      data: {
        caseId,
        stage,
        notes,
        operatorId
      }
    });
  }

  /**
   * 获取案件的阶段历史
   */
  async findByCaseId(caseId: string): Promise<StageHistory[]> {
    return this.model.findMany({
      where: { caseId },
      orderBy: { startedAt: 'desc' }
    });
  }
}

export const stageHistoryRepository = new StageHistoryRepository();
