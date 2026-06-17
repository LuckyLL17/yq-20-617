/**
 * 绩效路由
 * 处理绩效相关请求
 */

import { Router } from 'express';
import { performanceController } from '../controllers/performance.controller';
import { authenticateToken, requireRoles } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  calculatePerformanceDto,
  savePerformanceSharesDto,
  lawyerPerformanceQueryDto,
  monthlyReportQueryDto,
  rankingQueryDto
} from '../dto/performance.dto';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * @route POST /api/performance/calculate/:caseId
 * @desc 计算绩效分成
 * @access Private (Finance, Admin)
 */
router.post(
  '/calculate/:caseId',
  authenticateToken,
  requireRoles([UserRole.FINANCE, UserRole.ADMIN]),
  validateBody(calculatePerformanceDto),
  performanceController.calculatePerformance
);

/**
 * @route POST /api/performance/save/:caseId
 * @desc 保存绩效分成
 * @access Private (Finance, Admin)
 */
router.post(
  '/save/:caseId',
  authenticateToken,
  requireRoles([UserRole.FINANCE, UserRole.ADMIN]),
  validateBody(savePerformanceSharesDto),
  performanceController.savePerformanceShares
);

/**
 * @route GET /api/performance/case/:caseId
 * @desc 获取案件绩效分成
 * @access Private
 */
router.get('/case/:caseId', authenticateToken, performanceController.getCasePerformance);

/**
 * @route GET /api/performance/lawyer/:lawyerId
 * @desc 获取律师绩效
 * @access Private
 */
router.get(
  '/lawyer/:lawyerId',
  authenticateToken,
  validateQuery(lawyerPerformanceQueryDto),
  performanceController.getLawyerPerformance
);

/**
 * @route GET /api/performance/reports/monthly
 * @desc 获取月度绩效报告
 * @access Private (Finance, Admin)
 */
router.get(
  '/reports/monthly',
  authenticateToken,
  requireRoles([UserRole.FINANCE, UserRole.ADMIN]),
  validateQuery(monthlyReportQueryDto),
  performanceController.getMonthlyReport
);

/**
 * @route GET /api/performance/reports/ranking
 * @desc 获取绩效排名
 * @access Private (Finance, Admin)
 */
router.get(
  '/reports/ranking',
  authenticateToken,
  requireRoles([UserRole.FINANCE, UserRole.ADMIN]),
  validateQuery(rankingQueryDto),
  performanceController.getPerformanceRanking
);

export default router;
