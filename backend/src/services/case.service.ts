/**
 * 案件服务
 * 处理案件相关的业务逻辑
 */

import { caseRepository } from '../repositories/case.repository';
import { clientRepository } from '../repositories/client.repository';
import { userRepository } from '../repositories/user.repository';
import { NotFoundError } from '../common/errors';
import {
  CreateCaseDto,
  UpdateCaseDto,
  CaseQueryDto,
  CaseStageDto,
  LawyerAssignmentDto,
  EvidenceDto,
  HearingDto,
  TimeEntryDto,
  ConflictCheckDto,
  AdvanceFeeDto
} from '../dto/case.dto';
import { CaseStage, CaseStatus, UserRole, Prisma } from '@prisma/client';

export class CaseService {
  /**
   * 获取案件列表
   */
  async getAllCases(query: CaseQueryDto, user?: { id: string; role: string }) {
    const where: Prisma.LegalCaseWhereInput = {};

    if (query.status) where.status = query.status;
    if (query.stage) where.currentStage = query.stage;
    if (query.clientId) where.clientId = query.clientId;

    // 如果是客户角色，只能查看自己的案件
    if (user?.role === UserRole.CLIENT) {
      const userRecord = await userRepository.findById(user.id);
      if (userRecord?.email) {
        const client = await clientRepository.findByEmail(userRecord.email);
        if (client) {
          where.clientId = client.id;
        }
      }
    }

    return caseRepository.findAll(where);
  }

  /**
   * 获取案件统计
   */
  async getCaseStats() {
    return caseRepository.getStats();
  }

  /**
   * 根据ID获取案件详情
   */
  async getCaseById(id: string) {
    const caseItem = await caseRepository.findByIdWithDetails(id);
    if (!caseItem) {
      throw new NotFoundError('案件不存在');
    }
    return caseItem;
  }

  /**
   * 创建案件
   */
  async createCase(createCaseDto: CreateCaseDto, createdById: string) {
    // 验证客户是否存在
    const client = await clientRepository.findById(createCaseDto.clientId);
    if (!client) {
      throw new NotFoundError('客户不存在');
    }

    // 先创建案件
    const caseItem = await caseRepository.create({
      ...createCaseDto,
      status: CaseStatus.CONSULTATION,
      currentStage: CaseStage.CONSULTATION,
      createdById
    } as any);

    // 创建阶段历史
    await caseRepository.updateStage(
      caseItem.id,
      CaseStage.CONSULTATION,
      undefined,
      createdById
    );

    return caseItem;
  }

  /**
   * 更新案件
   */
  async updateCase(id: string, updateCaseDto: UpdateCaseDto) {
    const caseItem = await caseRepository.findById(id);
    if (!caseItem) {
      throw new NotFoundError('案件不存在');
    }

    return caseRepository.update(id, updateCaseDto);
  }

  /**
   * 删除案件
   */
  async deleteCase(id: string) {
    const caseItem = await caseRepository.findById(id);
    if (!caseItem) {
      throw new NotFoundError('案件不存在');
    }

    await caseRepository.delete(id);
    return { message: '案件已删除' };
  }

  /**
   * 更新案件阶段
   */
  async updateCaseStage(id: string, caseStageDto: CaseStageDto, operatorId: string) {
    const caseItem = await caseRepository.findById(id);
    if (!caseItem) {
      throw new NotFoundError('案件不存在');
    }

    return caseRepository.updateStage(
      id,
      caseStageDto.stage,
      caseStageDto.notes,
      operatorId
    );
  }

  /**
   * 分配律师
   */
  async assignLawyer(caseId: string, assignmentDto: LawyerAssignmentDto) {
    // 验证案件是否存在
    const caseItem = await caseRepository.findById(caseId);
    if (!caseItem) {
      throw new NotFoundError('案件不存在');
    }

    // 验证律师是否存在
    const lawyer = await userRepository.findById(assignmentDto.lawyerId);
    if (!lawyer) {
      throw new NotFoundError('律师不存在');
    }

    return caseRepository.assignLawyer(
      caseId,
      assignmentDto.lawyerId,
      assignmentDto.role,
      assignmentDto.allocation,
      assignmentDto.isLead
    );
  }

  /**
   * 移除律师分配
   */
  async removeLawyerAssignment(assignmentId: string) {
    return caseRepository.removeLawyerAssignment(assignmentId);
  }

  /**
   * 添加证据
   */
  async addEvidence(caseId: string, evidenceDto: EvidenceDto) {
    const caseItem = await caseRepository.findById(caseId);
    if (!caseItem) {
      throw new NotFoundError('案件不存在');
    }

    const data: Prisma.EvidenceCreateWithoutCaseItemInput = {
      ...evidenceDto,
      receivedDate: evidenceDto.receivedDate ? new Date(evidenceDto.receivedDate) : undefined
    };

    return caseRepository.addEvidence(caseId, data);
  }

  /**
   * 添加开庭记录
   */
  async addHearing(caseId: string, hearingDto: HearingDto) {
    const caseItem = await caseRepository.findById(caseId);
    if (!caseItem) {
      throw new NotFoundError('案件不存在');
    }

    const data: Prisma.HearingCreateWithoutCaseItemInput = {
      ...hearingDto,
      date: new Date(hearingDto.date)
    };

    return caseRepository.addHearing(caseId, data);
  }

  /**
   *添加工时记录
   */
  async addTimeEntry(caseId: string, timeEntryDto: TimeEntryDto, defaultLawyerId: string) {
    const caseItem = await caseRepository.findById(caseId);
    if (!caseItem) {
      throw new NotFoundError('案件不存在');
    }

    const lawyerId = timeEntryDto.lawyerId || defaultLawyerId;
    const date = timeEntryDto.date ? new Date(timeEntryDto.date) : new Date();

    const data = {
      lawyerId,
      hours: timeEntryDto.hours,
      description: timeEntryDto.description,
      rate: timeEntryDto.rate,
      isBillable: timeEntryDto.isBillable,
      date,
      taskType: timeEntryDto.taskType
    } as any;

    return caseRepository.addTimeEntry(caseId, data);
  }

  /**
   * 创建利益冲突审查
   */
  async createConflictCheck(caseId: string, conflictCheckDto: ConflictCheckDto, checkedById: string) {
    const caseItem = await caseRepository.findById(caseId);
    if (!caseItem) {
      throw new NotFoundError('案件不存在');
    }

    const data = {
      ...conflictCheckDto,
      checkedAt: conflictCheckDto.checkedAt ? new Date(conflictCheckDto.checkedAt) : new Date()
    } as any;

    return caseRepository.createConflictCheck(caseId, checkedById, data);
  }

  /**
   * 添加预支费用
   */
  async addAdvanceFee(caseId: string, advanceFeeDto: AdvanceFeeDto, createdById: string) {
    const caseItem = await caseRepository.findById(caseId);
    if (!caseItem) {
      throw new NotFoundError('案件不存在');
    }

    const data: Prisma.AdvanceFeeCreateWithoutCaseItemInput = {
      description: advanceFeeDto.description,
      amount: advanceFeeDto.amount
    };

    return caseRepository.addAdvanceFee(caseId, createdById, data);
  }
}

export const caseService = new CaseService();
