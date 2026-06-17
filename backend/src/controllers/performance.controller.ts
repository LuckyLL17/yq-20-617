import { Request, Response, NextFunction } from 'express';
import { PerformanceService } from '../services/performance.service';
import { success } from '../types/response';

const performanceService = new PerformanceService();

export class PerformanceController {
  async calculateShares(req: Request, res: Response, next: NextFunction) {
    try {
      const shares = await performanceService.calculateShares(req.params.caseId, req.body);
      res.json(success(shares));
    } catch (error) {
      next(error);
    }
  }

  async saveShares(req: Request, res: Response, next: NextFunction) {
    try {
      const savedShares = await performanceService.saveShares(req.params.caseId, req.body);
      res.status(201).json(success(savedShares, '保存绩效分配成功'));
    } catch (error) {
      next(error);
    }
  }

  async findSharesByCase(req: Request, res: Response, next: NextFunction) {
    try {
      const shares = await performanceService.findSharesByCase(req.params.caseId);
      res.json(success(shares));
    } catch (error) {
      next(error);
    }
  }

  async findSharesByLawyer(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await performanceService.findSharesByLawyer(req.params.lawyerId, req.query);
      res.json(success(result));
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await performanceService.getMonthlyReport(req.query);
      res.json(success(report));
    } catch (error) {
      next(error);
    }
  }

  async getRanking(req: Request, res: Response, next: NextFunction) {
    try {
      const ranking = await performanceService.getRanking(req.query);
      res.json(success(ranking));
    } catch (error) {
      next(error);
    }
  }
}
