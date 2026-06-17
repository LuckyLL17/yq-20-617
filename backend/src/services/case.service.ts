import { CaseStatus, CaseStage, UserRole } from '@prisma/client';
import {
  CreateCaseDtoType,
  UpdateCaseDtoType,
  UpdateCaseStageDtoType,
  AssignLawyerDtoType,
  AddEvidenceDtoType,
  AddHearingDtoType,
  AddTimeEntryDtoType,
  ConflictCheckDtoType,
  AddAdvanceFeeDtoType
} from '../dtos/case.dto';
import { caseRepository } from '../repositories/CaseRepository';
import { stageHistoryRepository } from '../repositories/StageHistoryRepository';
import { lawyerAssignmentRepository } from '../repositories/LawyerAssignmentRepository';
import { evidenceRepository } from '../repositories/EvidenceRepository';
import { hearingRepository } from '../repositories/HearingRepository';
import { timeEntryRepository } from '../repositories/TimeEntryRepository';
import { conflictCheckRepository } from '../repositories/ConflictCheckRepository';
import { advanceFeeRepository } from '../repositories/AdvanceFeeRepository';
import { clientRepository } from '../repositories/ClientRepository';
import { userRepository } from '../repositories/UserRepository';
import { NotFoundError, BadRequestError } from '../common/errors';

/**
 * 案件服务
 * 处理案件相关业务逻辑
 */
class CaseService {
  /**
   * 阶段与状态的映射关系
   */
  private stageToStatusMap: Record<string, CaseStatus> = {
    [CaseStage.CONSULTATION]: CaseStatus.CONSULTATION,
    [CaseStage.CONFLICT_CHECK]: CaseStatus.CONFLICT_CHECK,
    [CaseStage.APPROVAL]: CaseStatus.PENDING_APPROVAL,
    [CaseStage.COURT_HEARING]: CaseStatus.COURT_HEARING,
    [CaseStage.SETTLEMENT]: CaseStatus.SETTLEMENT,
    [CaseStage.ARCHIVE]: CaseStatus.CLOSED
  };

  /**
   * 获取案件列表
   */
  async getCases(
    filters: { status?: string; stage?: string; clientId?: string },
    userId?: string,
    userRole?: string
  ): Promise<any[]> {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.stage) where.currentStage = filters.stage;
    if (filters.clientId) where.clientId = filters.clientId;

    // 如果是客户角色，只显示自己的案件
    if (userRole === UserRole.CLIENT && userId) {
      const user = await userRepository.findById(userId);
      if (user && user.email) {
        const client = await clientRepository.findByEmail(user.email);
        if (client) {
          where.clientId = client.id;
        }
      }
    }

    return caseRepository.findAllWithRelations(where);
  }

  /**
   * 获取案件统计信息
   */
  async getCaseStats(): Promise<{ total: number; byStatus: any[]; byStage: any[] }> {
    const total = await caseRepository.count();
    const byStatus = await caseRepository.countByStatus();
    const byStage = await caseRepository.countByStage();
    return { total, byStatus, byStage };
  }

  /**
   * 根据 ID 获取案件详情
   */
  async getCaseById(id: string): Promise<any> {
    const caseItem = await caseRepository.findByIdWithDetails(id);
    if (!caseItem) {
      throw new NotFoundError('案件不存在', 'CASE_NOT_FOUND');
    }
    return caseItem;
  }

  /**
   * 创建案件
   */
  async createCase(createCaseDto: CreateCaseDtoType, createdById: string): Promise<any> {
    // 验证客户是否存在
    const client = await clientRepository.findById(createCaseDto.clientId);
    if (!client) {
      throw new NotFoundError('客户不存在', 'CLIENT_NOT_FOUND');
    }

    // 生成案件编号
    const caseNumber = caseRepository.generateCaseNumber();

    // 创建案件（包含初始阶段历史）
    const caseData: any = {
      ...createCaseDto,
      caseNumber,
      status: CaseStatus.CONSULTATION,
      currentStage: CaseStage.CONSULTATION,
      createdById,
      stageHistory: {
        create: {
          stage: CaseStage.CONSULTATION,
          operatorId: createdById
        }
      }
    };

    return caseRepository.create(caseData, {
      client: { select: { id: true, name: true } },
      stageHistory: true
    });
  }

  /**
   * 更新案件
   */
  async updateCase(id: string, updateCaseDto: UpdateCaseDtoType): Promise<any> {
    // 检查案件是否存在
    const existingCase = await caseRepository.findById(id);
    if (!existingCase) {
      throw new NotFoundError('案件不存在', 'CASE_NOT_FOUND');
    }

    return caseRepository.update(id, updateCaseDto as any);
  }

  /**
   * 删除案件
   */
  async deleteCase(id: string): Promise<void> {
    // 检查案件是否存在
    const existingCase = await caseRepository.findById(id);
    if (!existingCase) {
      throw new NotFoundError('案件不存在', 'CASE_NOT_FOUND');
    }

    await caseRepository.delete(id);
  }

  /**
   * 更新案件阶段
   */
  async updateCaseStage(
    caseId: string,
    updateStageDto: UpdateCaseStageDtoType,
    operatorId: string
  ): Promise<any> {
    // 检查案件是否存在
    const existingCase = await caseRepository.findById(caseId);
    if (!existingCase) {
      throw new NotFoundError('案件不存在', 'CASE_NOT_FOUND');
    }

    // 结束当前阶段
    await stageHistoryRepository.endCurrentStage(caseId);

    // 创建新阶段历史
    const history = await stageHistoryRepository.createStage(
      caseId,
      updateStageDto.stage,
      operatorId,
      updateStageDto.notes
    );

    // 根据阶段更新状态
    const status = this.stageToStatusMap[updateStageDto.stage] || CaseStatus.ACTIVE;
    const closedAt = updateStageDto.stage === CaseStage.ARCHIVE ? new Date() : null;

    // 更新案件
    await caseRepository.updateStage(caseId, updateStageDto.stage, status, closedAt);

    return history;
  }

  /**
   * 分配律师
   */
  async assignLawyer(caseId: string, assignLawyerDto: AssignLawyerDtoType): Promise<any> {
    // 检查案件是否存在
    const existingCase = await caseRepository.findById(caseId);
    if (!existingCase) {
      throw new NotFoundError('案件不存在', 'CASE_NOT_FOUND');
    }

    // 检查律师是否存在
    const lawyer = await userRepository.findById(assignLawyerDto.lawyerId);
    if (!lawyer) {
      throw new NotFoundError('律师不存在', 'LAWYER_NOT_FOUND');
    }

    return lawyerAssignmentRepository.createWithLawyer({
      caseId,
      lawyerId: assignLawyerDto.lawyerId,
      role: assignLawyerDto.role,
      allocation: assignLawyerDto.allocation,
      isLead: assignLawyerDto.isLead || false
    } as any);
  }

  /**
   * 移除律师分配
   */
  async removeLawyerAssignment(caseId: string, assignmentId: string): Promise<void> {
    // 检查案件是否存在
    const existingCase = await caseRepository.findById(caseId);
    if (!existingCase) {
      throw new NotFoundError('案件不存在', 'CASE_NOT_FOUND');
    }

    await lawyerAssignmentRepository.delete(assignmentId);
  }

  /**
   * 添加证据
   */
  async addEvidence(caseId: string, evidenceDto: AddEvidenceDtoType): Promise<any> {
    // 检查案件是否存在
    const existingCase = await caseRepository.findById(caseId);
    if (!existingCase) {
      throw new NotFoundError('案件不存在', 'CASE_NOT_FOUND');
    }

    return evidenceRepository.create({
      caseId,
      ...evidenceDto
    } as any);
  }

  /**
   * 添加庭审
   */
  async addHearing(caseId: string, hearingDto: AddHearingDtoType): Promise<any> {
    // 检查案件是否存在
    const existingCase = await caseRepository.findById(caseId);
    if (!existingCase) {
      throw new NotFoundError('案件不存在', 'CASE_NOT_FOUND');
    }

    return hearingRepository.create({
      caseId,
      ...hearingDto
    } as any);
  }

  /**
   * 添加工时记录
   */
  async addTimeEntry(
    caseId: string,
    timeEntryDto: AddTimeEntryDtoType,
    currentUserId: string
  ): Promise<any> {
    // 检查案件是否存在
    const existingCase = await caseRepository.findById(caseId);
    if (!existingCase) {
      throw new NotFoundError('案件不存在', 'CASE_NOT_FOUND');
    }

    const lawyerId = timeEntryDto.lawyerId || currentUserId;
    const date = timeEntryDto.date || new Date();

    return timeEntryRepository.createWithLawyer({
      caseId,
      lawyerId,
      hours: timeEntryDto.hours,
      description: timeEntryDto.description,
      taskType: timeEntryDto.taskType,
      rate: timeEntryDto.rate,
      isBillable: timeEntryDto.isBillable ?? true,
      date
    } as any);
  }

  /**
   * 创建冲突检查
   */
  async createConflictCheck(
    caseId: string,
    conflictCheckDto: ConflictCheckDtoType,
    checkedById: string
  ): Promise<any> {
    // 检查案件是否存在
    const existingCase = await caseRepository.findById(caseId);
    if (!existingCase) {
      throw new NotFoundError('案件不存在', 'CASE_NOT_FOUND');
    }

    return conflictCheckRepository.create({
      caseId,
      checkedById,
      ...conflictCheckDto
    } as any);
  }

  /**
   * 添加预付费
   */
  async addAdvanceFee(
    caseId: string,
    advanceFeeDto: AddAdvanceFeeDtoType,
    createdById: string
  ): Promise<any> {
    // 检查案件是否存在
    const existingCase = await caseRepository.findById(caseId);
    if (!existingCase) {
      throw new NotFoundError('案件不存在', 'CASE_NOT_FOUND');
    }

    return advanceFeeRepository.create({
      caseId,
      createdById,
      ...advanceFeeDto
    } as any);
  }
}

export const caseService = new CaseService();
