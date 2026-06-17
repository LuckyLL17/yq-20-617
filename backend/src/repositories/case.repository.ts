/**
 * 案件数据访问层
 * 封装所有案件相关的数据库操作
 */

import { prisma } from '../common/prisma';
import { LegalCase, Prisma, CaseStatus, CaseStage } from '@prisma/client';

export class CaseRepository {
  /**
   * 生成案件编号
   */
  generateCaseNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CASE-${year}-${random}`;
  }

  /**
   * 根据ID查找案件
   */
  async findById(id: string): Promise<LegalCase | null> {
    return prisma.legalCase.findUnique({
      where: { id }
    });
  }

  /**
   * 根据ID查找案件，包含所有关联数据
   */
  async findByIdWithDetails(id: string) {
    return prisma.legalCase.findUnique({
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
   * 获取案件列表
   */
  async findAll(where?: Prisma.LegalCaseWhereInput) {
    return prisma.legalCase.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        lawyerAssignments: {
          include: { lawyer: { select: { id: true, name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * 获取案件统计
   */
  async getStats() {
    const total = await prisma.legalCase.count();
    const byStatus = await prisma.legalCase.groupBy({
      by: ['status'],
      _count: true
    });
    const byStage = await prisma.legalCase.groupBy({
      by: ['currentStage'],
      _count: true
    });
    return { total, byStatus, byStage };
  }

  /**
   * 创建案件
   */
  async create(data: Prisma.LegalCaseUncheckedCreateInput) {
    return prisma.legalCase.create({
      data: {
        ...data,
        caseNumber: this.generateCaseNumber()
      },
      include: {
        client: { select: { id: true, name: true } },
        stageHistory: true
      }
    });
  }

  /**
   * 更新案件
   */
  async update(id: string, data: Prisma.LegalCaseUpdateInput): Promise<LegalCase> {
    return prisma.legalCase.update({
      where: { id },
      data
    });
  }

  /**
   * 删除案件
   */
  async delete(id: string): Promise<LegalCase> {
    return prisma.legalCase.delete({
      where: { id }
    });
  }

  /**
   * 更新案件阶段
   */
  async updateStage(
    caseId: string,
    stage: CaseStage,
    notes?: string,
    operatorId?: string
  ) {
    // 结束当前阶段
    await prisma.stageHistory.updateMany({
      where: { caseId, endedAt: null },
      data: { endedAt: new Date() }
    });

    // 创建新阶段历史
    const history = await prisma.stageHistory.create({
      data: {
        caseId,
        stage,
        notes,
        operatorId
      }
    });

    // 阶段与状态映射
    const statusMap: Record<string, CaseStatus> = {
      [CaseStage.CONSULTATION]: CaseStatus.CONSULTATION,
      [CaseStage.CONFLICT_CHECK]: CaseStatus.CONFLICT_CHECK,
      [CaseStage.APPROVAL]: CaseStatus.PENDING_APPROVAL,
      [CaseStage.COURT_HEARING]: CaseStatus.COURT_HEARING,
      [CaseStage.SETTLEMENT]: CaseStatus.SETTLEMENT,
      [CaseStage.ARCHIVE]: CaseStatus.CLOSED
    };

    await prisma.legalCase.update({
      where: { id: caseId },
      data: {
        currentStage: stage,
        status: statusMap[stage] || CaseStatus.ACTIVE,
        closedAt: stage === CaseStage.ARCHIVE ? new Date() : null
      }
    });

    return history;
  }

  /**
   * 分配律师
   */
  async assignLawyer(
    caseId: string,
    lawyerId: string,
    role: string,
    allocation: Prisma.Decimal | number,
    isLead: boolean = false
  ) {
    return prisma.lawyerAssignment.create({
      data: {
        caseId,
        lawyerId,
        role,
        allocation,
        isLead
      },
      include: { lawyer: { select: { id: true, name: true } } }
    });
  }

  /**
   * 移除律师分配
   */
  async removeLawyerAssignment(assignmentId: string) {
    return prisma.lawyerAssignment.delete({
      where: { id: assignmentId }
    });
  }

  /**
   * 添加证据
   */
  async addEvidence(caseId: string, data: Prisma.EvidenceCreateWithoutCaseItemInput) {
    return prisma.evidence.create({
      data: {
        caseId,
        ...data
      }
    });
  }

  /**
   * 添加开庭记录
   */
  async addHearing(caseId: string, data: Prisma.HearingCreateWithoutCaseItemInput) {
    return prisma.hearing.create({
      data: {
        caseId,
        ...data
      }
    });
  }

  /**
   *添加工时记录
   */
  async addTimeEntry(caseId: string, data: Prisma.TimeEntryUncheckedCreateInput) {
    const entryData = { ...data, caseId };
    return prisma.timeEntry.create({
      data: entryData,
      include: { lawyer: { select: { id: true, name: true } } }
    });
  }

  /**
   * 创建利益冲突审查
   */
  async createConflictCheck(
    caseId: string,
    checkedById: string,
    data: Prisma.ConflictCheckUncheckedCreateInput
  ) {
    const checkData = { ...data, caseId, checkedById };
    return prisma.conflictCheck.create({
      data: checkData
    });
  }

  /**
   * 添加预支费用
   */
  async addAdvanceFee(
    caseId: string,
    createdById: string,
    data: Prisma.AdvanceFeeCreateWithoutCaseItemInput
  ) {
    return prisma.advanceFee.create({
      data: {
        caseId,
        createdById,
        ...data
      }
    });
  }

  /**
   * 获取案件工时记录
   */
  async getTimeEntries(caseId: string) {
    return prisma.timeEntry.findMany({
      where: { caseId }
    });
  }

  /**
   * 获取案件律师分配
   */
  async getLawyerAssignments(caseId: string) {
    return prisma.lawyerAssignment.findMany({
      where: { caseId },
      include: { lawyer: { select: { id: true, name: true } } }
    });
  }
}

export const caseRepository = new CaseRepository();
