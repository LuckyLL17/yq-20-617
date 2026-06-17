import { Response } from 'express';
import { performanceService } from '../services/performance.service';
import { success, created } from '../utils/response';
import { AuthRequest } from '../types/common';
import {
  CalculatePerformanceDto,
  SavePerformanceSharesDto,
  LawyerPerformanceQueryDto,
  MonthlyReportQueryDto,
  RankingReportQueryDto
} from '../dtos/performance.dto';

/**
 * 绩效控制器
 * 处理绩效相关的 HTTP 请求
 */
export class PerformanceController {
  /**
   * 计算案件绩效分成
   */
  async calculatePerformance(req: AuthRequest, res: Response): Promise<void> {
    const { caseId } = req.params;
    const dto = req.body as CalculatePerformanceDto;
    const shares = await performanceService.calculatePerformance(caseId, dto);
    success(res, shares, '绩效计算成功');
  }

  /**
   * 保存绩效分成
   */
  async savePerformanceShares(req: AuthRequest, res: Response): Promise<void> {
    const { caseId } = req.params;
    const dto = req.body as SavePerformanceSharesDto;
    const shares = await performanceService.savePerformanceShares(caseId, dto);
    created(res, shares, '绩效分成保存成功');
  }

  /**
   * 获取案件的绩效分成
   */
  async getPerformanceByCaseId(req: AuthRequest, res: Response): Promise<void> {
    const { caseId } = req.params;
    const shares = await performanceService.getPerformanceByCaseId(caseId);
    success(res, shares, '获取案件绩效成功');
  }

  /**
   * 获取律师的绩效记录
   */
  async getPerformanceByLawyerId(req: AuthRequest, res: Response): Promise<void> {
    const { lawyerId } = req.params;
    const query = req.query as unknown as LawyerPerformanceQueryDto;
    const result = await performanceService.getPerformanceByLawyerId(lawyerId, query);
    success(res, result, '获取律师绩效成功');
  }

  /**
   * 获取月度绩效报告
   */
  async getMonthlyReport(req: AuthRequest, res: Response): Promise<void> {
    const query = req.query as unknown as MonthlyReportQueryDto;
    const report = await performanceService.getMonthlyReport(query);
    success(res, report, '获取月度报告成功');
  }

  /**
   * 获取律师绩效排名
   */
  async getRanking(req: AuthRequest, res: Response): Promise<void> {
    const query = req.query as unknown as RankingReportQueryDto;
    const ranking = await performanceService.getRanking(query);
    success(res, ranking, '获取绩效排名成功');
  }
}

export const performanceController = new PerformanceController();
