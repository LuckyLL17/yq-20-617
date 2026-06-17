/**
 * 绩效控制器
 * 处理绩效相关的HTTP请求
 */

import { Request, Response, NextFunction } from 'express';
import { performanceService } from '../services/performance.service';
import { success } from '../common/response';

export class PerformanceController {
  /**
   * 计算绩效分成
   */
  async calculatePerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const shares = await performanceService.calculatePerformance(
        req.params.caseId,
        req.body
      );
      res.json(success(shares, '绩效计算成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 保存绩效分成
   */
  async savePerformanceShares(req: Request, res: Response, next: NextFunction) {
    try {
      const shares = await performanceService.savePerformanceShares(
        req.params.caseId,
        req.body
      );
      res.status(201).json(success(shares, '绩效分成保存成功', 201));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取案件绩效分成
   */
  async getCasePerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const shares = await performanceService.getCasePerformance(req.params.caseId);
      res.json(success(shares, '获取案件绩效成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取律师绩效
   */
  async getLawyerPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await performanceService.getLawyerPerformance(
        req.params.lawyerId,
        req.query as any
      );
      res.json(success(result, '获取律师绩效成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取月度绩效报告
   */
  async getMonthlyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await performanceService.getMonthlyReport(req.query as any);
      res.json(success(report, '获取月度报告成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取绩效排名
   */
  async getPerformanceRanking(req: Request, res: Response, next: NextFunction) {
    try {
      const ranking = await performanceService.getPerformanceRanking(req.query as any);
      res.json(success(ranking, '获取绩效排名成功'));
    } catch (error) {
      next(error);
    }
  }
}

export const performanceController = new PerformanceController();
