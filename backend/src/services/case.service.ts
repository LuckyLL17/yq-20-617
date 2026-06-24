import { caseRepository } from '../repositories/case.repository';
import { clientRepository } from '../repositories/client.repository';
import {
  CreateCaseDto,
  UpdateCaseDto,
  CaseQueryDto,
  StageChangeDto,
  LawyerAssignmentDto,
  EvidenceCreateDto,
  HearingCreateDto,
  TimeEntryCreateDto,
  ConflictCheckDto,
  AdvanceFeeCreateDto
} from '../dtos/case.dto';
import { NotFoundError, BadRequestError } from '../errors/ApiError';
import { UserRole } from '@prisma/client';

/**
 * 案件服务
 * 处理案件相关的业务逻辑
 */
export class CaseService {
  /**
   * 获取案件列表
   * @param query 查询参数
   * @param userId 用户ID
   * @param userRole 用户角色
   */
  async getCases(query: CaseQueryDto = {}, userId?: string, userRole?: string) {
    let clientId: string | null = null;

    if (userRole === UserRole.CLIENT && userId) {
      clientId = await caseRepository.findByClientUserId(userId);
      if (clientId) {
        query = { ...query, clientId };
      }
    }

    return caseRepository.findAll(query, userId, userRole);
  }

  /**
   * 获取案件统计数据
   */
  async getCaseStats() {
    return caseRepository.getStats();
  }

  /**
   * 根据ID获取案件详情
   * @param id 案件ID
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
   * @param dto 案件数据
   * @param createdById 创建人ID
   */
  async createCase(dto: CreateCaseDto, createdById: string) {
    const clientExists = await clientRepository.exists(dto.clientId);
    if (!clientExists) {
      throw new BadRequestError('客户不存在');
    }

    return caseRepository.create(dto, createdById);
  }

  /**
   * 更新案件
   * @param id 案件ID
   * @param dto 更新数据
   */
  async updateCase(id: string, dto: UpdateCaseDto) {
    const exists = await caseRepository.exists(id);
    if (!exists) {
      throw new NotFoundError('案件不存在');
    }
    return caseRepository.update(id, dto);
  }

  /**
   * 删除案件
   * @param id 案件ID
   */
  async deleteCase(id: string) {
    const exists = await caseRepository.exists(id);
    if (!exists) {
      throw new NotFoundError('案件不存在');
    }
    await caseRepository.delete(id);
  }

  /**
   * 变更案件阶段
   * @param caseId 案件ID
   * @param dto 阶段数据
   * @param operatorId 操作人ID
   */
  async changeStage(caseId: string, dto: StageChangeDto, operatorId: string) {
    const exists = await caseRepository.exists(caseId);
    if (!exists) {
      throw new NotFoundError('案件不存在');
    }
    return caseRepository.changeStage(caseId, dto, operatorId);
  }

  /**
   * 分配律师
   * @param caseId 案件ID
   * @param dto 律师分配数据
   */
  async assignLawyer(caseId: string, dto: LawyerAssignmentDto) {
    const exists = await caseRepository.exists(caseId);
    if (!exists) {
      throw new NotFoundError('案件不存在');
    }
    return caseRepository.assignLawyer(caseId, dto);
  }

  /**
   * 移除律师分配
   * @param assignmentId 分配ID
   */
  async removeLawyerAssignment(assignmentId: string) {
    await caseRepository.removeLawyerAssignment(assignmentId);
  }

  /**
   * 添加证据
   * @param caseId 案件ID
   * @param dto 证据数据
   */
  async addEvidence(caseId: string, dto: EvidenceCreateDto) {
    const exists = await caseRepository.exists(caseId);
    if (!exists) {
      throw new NotFoundError('案件不存在');
    }
    return caseRepository.addEvidence(caseId, dto);
  }

  /**
   * 添加庭审
   * @param caseId 案件ID
   * @param dto 庭审数据
   */
  async addHearing(caseId: string, dto: HearingCreateDto) {
    const exists = await caseRepository.exists(caseId);
    if (!exists) {
      throw new NotFoundError('案件不存在');
    }
    return caseRepository.addHearing(caseId, dto);
  }

  /**
   * 添加工时记录
   * @param caseId 案件ID
   * @param dto 工时数据
   * @param defaultLawyerId 默认律师ID
   */
  async addTimeEntry(caseId: string, dto: TimeEntryCreateDto, defaultLawyerId: string) {
    const exists = await caseRepository.exists(caseId);
    if (!exists) {
      throw new NotFoundError('案件不存在');
    }
    return caseRepository.addTimeEntry(caseId, dto, defaultLawyerId);
  }

  /**
   * 创建利益冲突检查
   * @param caseId 案件ID
   * @param dto 检查数据
   * @param checkedById 检查人ID
   */
  async createConflictCheck(caseId: string, dto: ConflictCheckDto, checkedById: string) {
    const exists = await caseRepository.exists(caseId);
    if (!exists) {
      throw new NotFoundError('案件不存在');
    }
    return caseRepository.createConflictCheck(caseId, dto, checkedById);
  }

  /**
   * 添加预收费用
   * @param caseId 案件ID
   * @param dto 费用数据
   * @param createdById 创建人ID
   */
  async addAdvanceFee(caseId: string, dto: AdvanceFeeCreateDto, createdById: string) {
    const exists = await caseRepository.exists(caseId);
    if (!exists) {
      throw new NotFoundError('案件不存在');
    }
    return caseRepository.addAdvanceFee(caseId, dto, createdById);
  }
}

export const caseService = new CaseService();
