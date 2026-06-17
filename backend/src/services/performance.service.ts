import { performanceRepository } from '../repositories/performance.repository';
import {
  CalculatePerformanceDto,
  SavePerformanceSharesDto,
  LawyerPerformanceQueryDto,
  MonthlyReportQueryDto,
  RankingReportQueryDto
} from '../dtos/performance.dto';
import { NotFoundError } from '../errors/ApiError';
import { calculatePerformanceShares } from '../utils/performanceCalculator';

/**
 * 绩效服务
 * 处理绩效相关的业务逻辑
 */
export class PerformanceService {
  /**
   * 计算案件绩效分成
   * @param caseId 案件ID
   * @param dto 计算数据
   */
  async calculatePerformance(caseId: string, dto: CalculatePerformanceDto) {
    const caseItem = await performanceRepository.getCaseWithTimeAndLawyers(caseId);
    if (!caseItem) {
      throw new NotFoundError('案件不存在');
    }

    return calculatePerformanceShares(
      caseItem.timeEntries,
      caseItem.lawyerAssignments,
      dto.totalFee
    );
  }

  /**
   * 保存绩效分成
   * @param caseId 案件ID
   * @param dto 分成数据
   */
  async savePerformanceShares(caseId: string, dto: SavePerformanceSharesDto) {
    const caseExists = await performanceRepository.caseExists(caseId);
    if (!caseExists) {
      throw new NotFoundError('案件不存在');
    }

    return performanceRepository.saveShares(caseId, dto);
  }

  /**
   * 获取案件的绩效分成
   * @param caseId 案件ID
   */
  async getPerformanceByCaseId(caseId: string) {
    const caseExists = await performanceRepository.caseExists(caseId);
    if (!caseExists) {
      throw new NotFoundError('案件不存在');
    }

    return performanceRepository.getSharesByCaseId(caseId);
  }

  /**
   * 获取律师的绩效记录
   * @param lawyerId 律师ID
   * @param query 查询参数
   */
  async getPerformanceByLawyerId(lawyerId: string, query: LawyerPerformanceQueryDto = {}) {
    return performanceRepository.getSharesByLawyerId(lawyerId, query);
  }

  /**
   * 获取月度绩效报告
   * @param query 查询参数
   */
  async getMonthlyReport(query: MonthlyReportQueryDto) {
    return performanceRepository.getMonthlyReport(query);
  }

  /**
   * 获取律师绩效排名
   * @param query 查询参数
   */
  async getRanking(query: RankingReportQueryDto) {
    return performanceRepository.getRanking(query);
  }
}

export const performanceService = new PerformanceService();
