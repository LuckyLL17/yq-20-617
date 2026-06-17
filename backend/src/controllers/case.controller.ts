import { Request, Response, NextFunction } from 'express';
import { caseService } from '../services/case.service';
import { success, created } from '../common/response';
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
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * 案件控制器
 * 处理案件相关的 HTTP 请求
 */
class CaseController {
  /**
   * 获取案件列表
   */
  async getCases(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, stage, clientId } = req.query;
      const cases = await caseService.getCases(
        {
          status: status as string,
          stage: stage as string,
          clientId: clientId as string
        },
        req.user?.id,
        req.user?.role
      );
      res.json(success(cases, '获取案件列表成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取案件统计
   */
  async getCaseStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await caseService.getCaseStats();
      res.json(success(stats, '获取案件统计成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 根据 ID 获取案件详情
   */
  async getCaseById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const caseItem = await caseService.getCaseById(req.params.id);
      res.json(success(caseItem, '获取案件详情成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建案件
   */
  async createCase(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const createCaseDto: CreateCaseDtoType = req.validatedBody || req.body;
      const caseItem = await caseService.createCase(createCaseDto, req.user!.id);
      res.status(201).json(created(caseItem, '创建案件成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新案件
   */
  async updateCase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updateCaseDto: UpdateCaseDtoType = req.validatedBody || req.body;
      const caseItem = await caseService.updateCase(req.params.id, updateCaseDto);
      res.json(success(caseItem, '更新案件成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除案件
   */
  async deleteCase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await caseService.deleteCase(req.params.id);
      res.json(success(null, '案件已删除'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新案件阶段
   */
  async updateCaseStage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updateStageDto: UpdateCaseStageDtoType = req.validatedBody || req.body;
      const history = await caseService.updateCaseStage(
        req.params.id,
        updateStageDto,
        req.user!.id
      );
      res.json(success(history, '更新案件阶段成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 分配律师
   */
  async assignLawyer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignLawyerDto: AssignLawyerDtoType = req.validatedBody || req.body;
      const assignment = await caseService.assignLawyer(req.params.id, assignLawyerDto);
      res.status(201).json(created(assignment, '分配律师成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 移除律师分配
   */
  async removeLawyerAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await caseService.removeLawyerAssignment(req.params.id, req.params.assignmentId);
      res.json(success(null, '已移除律师分配'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 添加证据
   */
  async addEvidence(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const evidenceDto: AddEvidenceDtoType = req.validatedBody || req.body;
      const evidence = await caseService.addEvidence(req.params.id, evidenceDto);
      res.status(201).json(created(evidence, '添加证据成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 添加庭审
   */
  async addHearing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const hearingDto: AddHearingDtoType = req.validatedBody || req.body;
      const hearing = await caseService.addHearing(req.params.id, hearingDto);
      res.status(201).json(created(hearing, '添加庭审成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 添加工时记录
   */
  async addTimeEntry(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const timeEntryDto: AddTimeEntryDtoType = req.validatedBody || req.body;
      const timeEntry = await caseService.addTimeEntry(
        req.params.id,
        timeEntryDto,
        req.user!.id
      );
      res.status(201).json(created(timeEntry, '添加工时记录成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建冲突检查
   */
  async createConflictCheck(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const conflictCheckDto: ConflictCheckDtoType = req.validatedBody || req.body;
      const conflictCheck = await caseService.createConflictCheck(
        req.params.id,
        conflictCheckDto,
        req.user!.id
      );
      res.status(201).json(created(conflictCheck, '创建冲突检查成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 添加预付费
   */
  async addAdvanceFee(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const advanceFeeDto: AddAdvanceFeeDtoType = req.validatedBody || req.body;
      const advanceFee = await caseService.addAdvanceFee(
        req.params.id,
        advanceFeeDto,
        req.user!.id
      );
      res.status(201).json(created(advanceFee, '添加预付费成功'));
    } catch (error) {
      next(error);
    }
  }
}

export const caseController = new CaseController();
