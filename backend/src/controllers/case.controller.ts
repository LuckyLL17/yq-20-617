import { Response } from 'express';
import { caseService } from '../services/case.service';
import { success, created, noContent } from '../utils/response';
import { AuthRequest } from '../types/common';
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

/**
 * 案件控制器
 * 处理案件相关的 HTTP 请求
 */
export class CaseController {
  /**
   * 获取案件列表
   */
  async getCases(req: AuthRequest, res: Response): Promise<void> {
    const query = req.query as unknown as CaseQueryDto;
    const cases = await caseService.getCases(query, req.user?.id, req.user?.role);
    success(res, cases, '获取案件列表成功');
  }

  /**
   * 获取案件统计数据
   */
  async getCaseStats(req: AuthRequest, res: Response): Promise<void> {
    const stats = await caseService.getCaseStats();
    success(res, stats, '获取案件统计成功');
  }

  /**
   * 获取案件详情
   */
  async getCaseById(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const caseItem = await caseService.getCaseById(id);
    success(res, caseItem, '获取案件详情成功');
  }

  /**
   * 创建案件
   */
  async createCase(req: AuthRequest, res: Response): Promise<void> {
    const dto = req.body as CreateCaseDto;
    const caseItem = await caseService.createCase(dto, req.user!.id);
    created(res, caseItem, '创建案件成功');
  }

  /**
   * 更新案件
   */
  async updateCase(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateCaseDto;
    const caseItem = await caseService.updateCase(id, dto);
    success(res, caseItem, '更新案件成功');
  }

  /**
   * 删除案件
   */
  async deleteCase(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    await caseService.deleteCase(id);
    noContent(res, '案件已删除');
  }

  /**
   * 变更案件阶段
   */
  async changeStage(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as StageChangeDto;
    const history = await caseService.changeStage(id, dto, req.user!.id);
    success(res, history, '阶段变更成功');
  }

  /**
   * 分配律师
   */
  async assignLawyer(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as LawyerAssignmentDto;
    const assignment = await caseService.assignLawyer(id, dto);
    created(res, assignment, '律师分配成功');
  }

  /**
   * 移除律师分配
   */
  async removeLawyerAssignment(req: AuthRequest, res: Response): Promise<void> {
    const { assignmentId } = req.params;
    await caseService.removeLawyerAssignment(assignmentId);
    noContent(res, '已移除律师分配');
  }

  /**
   * 添加证据
   */
  async addEvidence(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as EvidenceCreateDto;
    const evidence = await caseService.addEvidence(id, dto);
    created(res, evidence, '证据添加成功');
  }

  /**
   * 添加庭审
   */
  async addHearing(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as HearingCreateDto;
    const hearing = await caseService.addHearing(id, dto);
    created(res, hearing, '庭审添加成功');
  }

  /**
   * 添加工时记录
   */
  async addTimeEntry(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as TimeEntryCreateDto;
    const timeEntry = await caseService.addTimeEntry(id, dto, req.user!.id);
    created(res, timeEntry, '工时记录添加成功');
  }

  /**
   * 创建利益冲突检查
   */
  async createConflictCheck(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as ConflictCheckDto;
    const conflictCheck = await caseService.createConflictCheck(id, dto, req.user!.id);
    created(res, conflictCheck, '利益冲突检查创建成功');
  }

  /**
   * 添加预收费用
   */
  async addAdvanceFee(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as AdvanceFeeCreateDto;
    const advanceFee = await caseService.addAdvanceFee(id, dto, req.user!.id);
    created(res, advanceFee, '预收费用添加成功');
  }
}

export const caseController = new CaseController();
