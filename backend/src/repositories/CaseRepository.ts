import { LegalCase, Prisma, CaseStage, CaseStatus } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

/**
 * 案件数据访问层
 */
class CaseRepository extends BaseRepository<LegalCase, Prisma.LegalCaseCreateInput, Prisma.LegalCaseUpdateInput> {
  constructor() {
    super('LegalCase');
  }

  protected get model() {
    return this.prisma.legalCase;
  }

  /**
   * 获取案件列表（包含关联信息）
   */
  async findAllWithRelations(
    where?: Prisma.LegalCaseWhereInput,
    orderBy?: Prisma.LegalCaseOrderByWithRelationInput
  ): Promise<LegalCase[]> {
    return this.model.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        lawyerAssignments: {
          include: { lawyer: { select: { id: true, name: true } } }
        }
      },
      orderBy: orderBy || { createdAt: 'desc' }
    });
  }

  /**
   * 获取案件详情（包含所有关联信息）
   */
  async findByIdWithDetails(id: string): Promise<LegalCase | null> {
    return this.model.findUnique({
      where: { id },
      include: {
        client: true,
        createdBy: { select: { id: true, name: true, email: true } },
        stageHistory: { orderBy: { startedAt: 'desc' } },
        lawyerAssignments: {
          include: { lawyer: { select: { id: true, name: true, email: true } } }
        },
        evidence: true,
        hearings: { orderBy: { date: 'asc' } },
        timeEntries: {
          include: { lawyer: { select: { id: true, name: true } } },
          orderBy: { date: 'desc' }
        },
        invoices: {
          include: { items: true, payments: true },
          orderBy: { createdAt: 'desc' }
        },
        payments: { orderBy: { paymentDate: 'desc' } },
        advanceFees: { orderBy: { createdAt: 'desc' } },
        performanceShares: {
          include: { lawyer: { select: { id: true, name: true } } }
        },
        conflictCheck: true,
        documents: true
      }
    });
  }

  /**
   * 统计案件数量
   */
  async countByStatus(): Promise<any[]> {
    return this.model.groupBy({
      by: ['status'],
      _count: true
    });
  }

  /**
   * 统计各阶段案件数量
   */
  async countByStage(): Promise<any[]> {
    return this.model.groupBy({
      by: ['currentStage'],
      _count: true
    });
  }

  /**
   * 更新案件阶段
   */
  async updateStage(caseId: string, stage: CaseStage, status: CaseStatus, closedAt?: Date | null): Promise<LegalCase> {
    return this.model.update({
      where: { id: caseId },
      data: {
        currentStage: stage,
        status,
        closedAt: closedAt || null
      }
    });
  }

  /**
   * 生成案件编号
   */
  generateCaseNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CASE-${year}-${random}`;
  }

  /**
   * 获取案件及其时间条目
   */
  async findByIdWithTimeEntries(id: string): Promise<LegalCase | null> {
    return this.model.findUnique({
      where: { id },
      include: { timeEntries: true }
    });
  }

  /**
   * 获取案件及其律师分配和时间条目
   */
  async findByIdWithLawyersAndTimeEntries(id: string): Promise<LegalCase | null> {
    return this.model.findUnique({
      where: { id },
      include: {
        timeEntries: true,
        lawyerAssignments: {
          include: { lawyer: { select: { id: true, name: true } } }
        }
      }
    });
  }
}

export const caseRepository = new CaseRepository();
