import { prisma } from '../config/prisma';
import { LegalCase, CaseStatus, CaseStage } from '@prisma/client';
import { CreateCaseDto, UpdateCaseDto, CaseQueryDto, StageChangeDto, LawyerAssignmentDto, EvidenceCreateDto, HearingCreateDto, TimeEntryCreateDto, ConflictCheckDto, AdvanceFeeCreateDto } from '../dtos/case.dto';
import { Prisma } from '@prisma/client';

/**
 * 案件数据访问层
 * 封装所有案件相关的数据库操作
 */
export class CaseRepository {
  /**
   * 案件列表关联字段
   */
  private listInclude = {
    client: { select: { id: true, name: true } },
    createdBy: { select: { id: true, name: true } },
    lawyerAssignments: {
      include: { lawyer: { select: { id: true, name: true } } }
    }
  };

  /**
   * 案件详情关联字段
   */
  private detailInclude = {
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
  };

  /**
   * 生成案号
   */
  private generateCaseNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CASE-${year}-${random}`;
  }

  /**
   * 查询案件列表
   * @param query 查询参数
   * @param userId 用户ID（客户端用户时使用）
   * @param userRole 用户角色
   */
  async findAll(query: CaseQueryDto = {}, userId?: string, userRole?: string): Promise<LegalCase[]> {
    const where: Prisma.LegalCaseWhereInput = {};
    
    if (query.status) {
      where.status = query.status;
    }
    if (query.stage) {
      where.currentStage = query.stage;
    }
    if (query.clientId) {
      where.clientId = query.clientId;
    }

    const cases = await prisma.legalCase.findMany({
      where,
      include: this.listInclude,
      orderBy: { createdAt: 'desc' }
    });

    return cases as any;
  }

  /**
   * 根据客户端用户ID过滤案件
   * @param userId 用户ID
   */
  async findByClientUserId(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) return null;

    const client = await prisma.client.findFirst({
      where: { email: user.email }
    });
    return client?.id || null;
  }

  /**
   * 获取案件统计数据
   */
  async getStats(): Promise<{ total: number; byStatus: any[]; byStage: any[] }> {
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
   * 根据ID查找案件
   * @param id 案件ID
   */
  async findById(id: string): Promise<LegalCase | null> {
    return prisma.legalCase.findUnique({
      where: { id }
    });
  }

  /**
   * 根据ID查找案件（详情）
   * @param id 案件ID
   */
  async findByIdWithDetails(id: string): Promise<any> {
    return prisma.legalCase.findUnique({
      where: { id },
      include: this.detailInclude
    });
  }

  /**
   * 创建案件
   * @param data 案件数据
   * @param createdById 创建人ID
   */
  async create(data: CreateCaseDto, createdById: string): Promise<any> {
    return prisma.legalCase.create({
      data: {
        caseNumber: this.generateCaseNumber(),
        title: data.title,
        description: data.description || null,
        caseType: data.caseType,
        status: CaseStatus.CONSULTATION,
        currentStage: CaseStage.CONSULTATION,
        priority: data.priority || null,
        court: data.court || null,
        caseNo: data.caseNo || null,
        opposingParty: data.opposingParty || null,
        claimAmount: data.claimAmount || null,
        clientId: data.clientId,
        createdById,
        billingMode: data.billingMode,
        estimatedFee: data.estimatedFee || null,
        contingencyRate: data.contingencyRate || null,
        stageHistory: {
          create: {
            stage: CaseStage.CONSULTATION,
            operatorId: createdById
          }
        }
      },
      include: {
        client: { select: { id: true, name: true } },
        stageHistory: true
      }
    });
  }

  /**
   * 更新案件
   * @param id 案件ID
   * @param data 更新数据
   */
  async update(id: string, data: UpdateCaseDto): Promise<LegalCase> {
    return prisma.legalCase.update({
      where: { id },
      data
    });
  }

  /**
   * 删除案件
   * @param id 案件ID
   */
  async delete(id: string): Promise<void> {
    await prisma.legalCase.delete({
      where: { id }
    });
  }

  /**
   * 变更案件阶段
   * @param caseId 案件ID
   * @param data 阶段数据
   * @param operatorId 操作人ID
   */
  async changeStage(caseId: string, data: StageChangeDto, operatorId: string): Promise<any> {
    await prisma.stageHistory.updateMany({
      where: { caseId, endedAt: null },
      data: { endedAt: new Date() }
    });

    const history = await prisma.stageHistory.create({
      data: {
        caseId,
        stage: data.stage,
        notes: data.notes,
        operatorId
      }
    });

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
        currentStage: data.stage,
        status: statusMap[data.stage] || CaseStatus.ACTIVE,
        closedAt: data.stage === CaseStage.ARCHIVE ? new Date() : null
      }
    });

    return history;
  }

  /**
   * 分配律师
   * @param caseId 案件ID
   * @param data 律师分配数据
   */
  async assignLawyer(caseId: string, data: LawyerAssignmentDto): Promise<any> {
    return prisma.lawyerAssignment.create({
      data: {
        caseId,
        lawyerId: data.lawyerId,
        role: data.role,
        allocation: data.allocation,
        isLead: data.isLead || false
      },
      include: { lawyer: { select: { id: true, name: true } } }
    });
  }

  /**
   * 移除律师分配
   * @param assignmentId 分配ID
   */
  async removeLawyerAssignment(assignmentId: string): Promise<void> {
    await prisma.lawyerAssignment.delete({
      where: { id: assignmentId }
    });
  }

  /**
   * 添加证据
   * @param caseId 案件ID
   * @param data 证据数据
   */
  async addEvidence(caseId: string, data: EvidenceCreateDto): Promise<any> {
    return prisma.evidence.create({
      data: {
        caseId,
        ...data,
        receivedDate: data.receivedDate ? new Date(data.receivedDate) : null
      }
    });
  }

  /**
   * 添加庭审
   * @param caseId 案件ID
   * @param data 庭审数据
   */
  async addHearing(caseId: string, data: HearingCreateDto): Promise<any> {
    return prisma.hearing.create({
      data: {
        caseId,
        title: data.title,
        date: new Date(data.date),
        court: data.court || null,
        courtroom: data.courtroom || null,
        judge: data.judge || null,
        notes: data.notes || null,
        outcome: data.outcome || null
      }
    });
  }

  /**
   * 添加工时记录
   * @param caseId 案件ID
   * @param data 工时数据
   * @param defaultLawyerId 默认律师ID
   */
  async addTimeEntry(caseId: string, data: TimeEntryCreateDto, defaultLawyerId: string): Promise<any> {
    return prisma.timeEntry.create({
      data: {
        caseId,
        lawyerId: data.lawyerId || defaultLawyerId,
        date: data.date ? new Date(data.date) : new Date(),
        hours: data.hours,
        description: data.description,
        taskType: data.taskType || null,
        rate: data.rate || 0,
        isBillable: data.isBillable !== undefined ? data.isBillable : true
      },
      include: { lawyer: { select: { id: true, name: true } } }
    });
  }

  /**
   * 创建利益冲突检查
   * @param caseId 案件ID
   * @param data 检查数据
   * @param checkedById 检查人ID
   */
  async createConflictCheck(caseId: string, data: ConflictCheckDto, checkedById: string): Promise<any> {
    return prisma.conflictCheck.create({
      data: {
        caseId,
        checkedById,
        hasConflict: data.hasConflict,
        conflictDetails: data.conflictDetails || null,
        status: data.status || 'COMPLETED',
        checkedAt: new Date()
      }
    });
  }

  /**
   * 添加预收费用
   * @param caseId 案件ID
   * @param data 费用数据
   * @param createdById 创建人ID
   */
  async addAdvanceFee(caseId: string, data: AdvanceFeeCreateDto, createdById: string): Promise<any> {
    return prisma.advanceFee.create({
      data: {
        caseId,
        description: data.description,
        amount: data.amount,
        createdById
      }
    });
  }

  /**
   * 检查案件是否存在
   * @param id 案件ID
   */
  async exists(id: string): Promise<boolean> {
    const count = await prisma.legalCase.count({
      where: { id }
    });
    return count > 0;
  }

  /**
   * 检查案号是否存在
   * @param caseNumber 案号
   */
  async existsByCaseNumber(caseNumber: string): Promise<boolean> {
    const count = await prisma.legalCase.count({
      where: { caseNumber }
    });
    return count > 0;
  }
}

export const caseRepository = new CaseRepository();
