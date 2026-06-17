/**
 * 案件控制器
 * 处理案件相关的HTTP请求
 */

import { Request, Response, NextFunction } from 'express';
import { caseService } from '../services/case.service';
import { success } from '../common/response';
import { AuthRequest } from '../middleware/auth';

export class CaseController {
  /**
   * 获取案件列表
   */
  async getAllCases(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cases = await caseService.getAllCases(req.query as any, req.user);
      res.json(success(cases, '获取案件列表成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取案件统计
   */
  async getCaseStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await caseService.getCaseStats();
      res.json(success(stats, '获取案件统计成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取案件详情
   */
  async getCaseById(req: Request, res: Response, next: NextFunction) {
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
  async createCase(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const caseItem = await caseService.createCase(req.body, req.user!.id);
      res.status(201).json(success(caseItem, '创建案件成功', 201));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新案件
   */
  async updateCase(req: Request, res: Response, next: NextFunction) {
    try {
      const caseItem = await caseService.updateCase(req.params.id, req.body);
      res.json(success(caseItem, '更新案件成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除案件
   */
  async deleteCase(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await caseService.deleteCase(req.params.id);
      res.json(success(result, '案件已删除'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新案件阶段
   */
  async updateCaseStage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const history = await caseService.updateCaseStage(
        req.params.id,
        req.body,
        req.user!.id
      );
      res.json(success(history, '案件阶段更新成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 分配律师
   */
  async assignLawyer(req: Request, res: Response, next: NextFunction) {
    try {
      const assignment = await caseService.assignLawyer(req.params.id, req.body);
      res.status(201).json(success(assignment, '律师分配成功', 201));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 移除律师分配
   */
  async removeLawyerAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      await caseService.removeLawyerAssignment(req.params.assignmentId);
      res.json(success({ message: '已移除律师分配' }, '律师分配已移除'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 添加证据
   */
  async addEvidence(req: Request, res: Response, next: NextFunction) {
    try {
      const evidence = await caseService.addEvidence(req.params.id, req.body);
      res.status(201).json(success(evidence, '证据添加成功', 201));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 添加开庭记录
   */
  async addHearing(req: Request, res: Response, next: NextFunction) {
    try {
      const hearing = await caseService.addHearing(req.params.id, req.body);
      res.status(201).json(success(hearing, '开庭记录添加成功', 201));
    } catch (error) {
      next(error);
    }
  }

  /**
   *添加工时记录
   */
  async addTimeEntry(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const timeEntry = await caseService.addTimeEntry(
        req.params.id,
        req.body,
        req.user!.id
      );
      res.status(201).json(success(timeEntry, '工时记录添加成功', 201));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建利益冲突审查
   */
  async createConflictCheck(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const conflictCheck = await caseService.createConflictCheck(
        req.params.id,
        req.body,
        req.user!.id
      );
      res.status(201).json(success(conflictCheck, '利益冲突审查创建成功', 201));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 添加预支费用
   */
  async addAdvanceFee(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const advanceFee = await caseService.addAdvanceFee(
        req.params.id,
        req.body,
        req.user!.id
      );
      res.status(201).json(success(advanceFee, '预支费用添加成功', 201));
    } catch (error) {
      next(error);
    }
  }
}

export const caseController = new CaseController();
