import { Request, Response, NextFunction } from 'express';
import { performanceService } from '../services/performance.service';
import { success, created } from '../common/response';
import {
  CalculatePerformanceDtoType,
  SavePerformanceSharesDtoType,
  PerformanceQueryDtoType,
  MonthlyReportDtoType
} from '../dtos/performance.dto';

/**
 * 绩效控制器
 * 处理绩效分成、报表相关的 HTTP 请求
 */
class PerformanceController {
  /**
   * 计算案件绩效分成
   */
  async calculatePerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const calculateDto: CalculatePerformanceDtoType = req.validatedBody || req.body;
      const shares = await performanceService.calculatePerformance(
        req.params.caseId,
        calculateDto
      );
      res.json(success(shares, '绩效计算成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 保存绩效分成
   */
  async savePerformanceShares(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const saveDto: SavePerformanceSharesDtoType = req.validatedBody || req.body;
      const shares = await performanceService.savePerformanceShares(
        req.params.caseId,
        saveDto
      );
      res.status(201).json(created(shares, '保存绩效分成成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取案件的绩效分成
   */
  async getCasePerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const shares = await performanceService.getCasePerformance(req.params.caseId);
      res.json(success(shares, '获取案件绩效成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取律师的绩效分成
   */
  async getLawyerPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const result = await performanceService.getLawyerPerformance(req.params.lawyerId, {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: 10
      });
      res.json(success(result, '获取律师绩效成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取月度绩效报表
   */
  async getMonthlyReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { month, year } = req.query;
      const report = await performanceService.getMonthlyReport({
        month: Number(month),
        year: Number(year)
      });
      res.json(success(report, '获取月度报表成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取律师绩效排名
   */
  async getLawyerRanking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, limit } = req.query;
      const ranking = await performanceService.getLawyerRanking({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: limit ? Number(limit) : 10
      });
      res.json(success(ranking, '获取绩效排名成功'));
    } catch (error) {
      next(error);
    }
  }
}

export const performanceController = new PerformanceController();
