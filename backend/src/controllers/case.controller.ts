import { Request, Response, NextFunction } from 'express';
import { CaseService } from '../services/case.service';
import { success } from '../types/response';

const caseService = new CaseService();

export class CaseController {
  async findMany(req: Request, res: Response, next: NextFunction) {
    try {
      const cases = await caseService.findMany(req.query, req.user!);
      res.json(success(cases));
    } catch (error) {
      next(error);
    }
  }

  async findStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await caseService.findStats();
      res.json(success(stats));
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const caseItem = await caseService.findById(req.params.id);
      res.json(success(caseItem));
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const caseItem = await caseService.create(req.body, req.user!);
      res.status(201).json(success(caseItem, '创建案件成功'));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const caseItem = await caseService.update(req.params.id, req.body);
      res.json(success(caseItem, '更新案件成功'));
    } catch (error) {
      next(error);
    }
  }

  async advanceStage(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await caseService.advanceStage(req.params.id, req.body, req.user!);
      res.json(success(history, '阶段推进成功'));
    } catch (error) {
      next(error);
    }
  }

  async assignLawyer(req: Request, res: Response, next: NextFunction) {
    try {
      const assignment = await caseService.assignLawyer(req.params.id, req.body);
      res.status(201).json(success(assignment, '律师分配成功'));
    } catch (error) {
      next(error);
    }
  }

  async removeLawyerAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      await caseService.removeLawyerAssignment(req.params.assignmentId);
      res.json(success(null, '已移除律师分配'));
    } catch (error) {
      next(error);
    }
  }

  async addEvidence(req: Request, res: Response, next: NextFunction) {
    try {
      const evidence = await caseService.addEvidence(req.params.id, req.body);
      res.status(201).json(success(evidence, '添加证据成功'));
    } catch (error) {
      next(error);
    }
  }

  async addHearing(req: Request, res: Response, next: NextFunction) {
    try {
      const hearing = await caseService.addHearing(req.params.id, req.body);
      res.status(201).json(success(hearing, '添加听证会成功'));
    } catch (error) {
      next(error);
    }
  }

  async addTimeEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const timeEntry = await caseService.addTimeEntry(req.params.id, req.body, req.user!);
      res.status(201).json(success(timeEntry, '添加工时记录成功'));
    } catch (error) {
      next(error);
    }
  }

  async addConflictCheck(req: Request, res: Response, next: NextFunction) {
    try {
      const conflictCheck = await caseService.addConflictCheck(req.params.id, req.body, req.user!);
      res.status(201).json(success(conflictCheck, '利益冲突检查完成'));
    } catch (error) {
      next(error);
    }
  }

  async addAdvanceFee(req: Request, res: Response, next: NextFunction) {
    try {
      const advanceFee = await caseService.addAdvanceFee(req.params.id, req.body, req.user!);
      res.status(201).json(success(advanceFee, '添加垫付费用成功'));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await caseService.delete(req.params.id);
      res.json(success(null, '案件已删除'));
    } catch (error) {
      next(error);
    }
  }
}
