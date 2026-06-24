import { Router } from 'express';
import { performanceController } from '../controllers/performance.controller';
import { authenticateToken, requireRoles } from '../middleware/auth';
import { asyncHandler, validateBody } from '../middleware/validate';
import {
  calculatePerformanceDto,
  savePerformanceSharesDto
} from '../dtos/performance.dto';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * 绩效路由
 * 处理绩效相关请求
 */

// 计算案件绩效分成（仅财务和管理员）
router.post(
  '/calculate/:caseId',
  authenticateToken,
  requireRoles([UserRole.FINANCE, UserRole.ADMIN]),
  validateBody(calculatePerformanceDto),
  asyncHandler(performanceController.calculatePerformance.bind(performanceController))
);

// 保存绩效分成（仅财务和管理员）
router.post(
  '/save/:caseId',
  authenticateToken,
  requireRoles([UserRole.FINANCE, UserRole.ADMIN]),
  validateBody(savePerformanceSharesDto),
  asyncHandler(performanceController.savePerformanceShares.bind(performanceController))
);

// 获取案件的绩效分成
router.get(
  '/case/:caseId',
  authenticateToken,
  asyncHandler(performanceController.getPerformanceByCaseId.bind(performanceController))
);

// 获取律师的绩效记录
router.get(
  '/lawyer/:lawyerId',
  authenticateToken,
  asyncHandler(performanceController.getPerformanceByLawyerId.bind(performanceController))
);

// 获取月度绩效报告（仅财务和管理员）
router.get(
  '/reports/monthly',
  authenticateToken,
  requireRoles([UserRole.FINANCE, UserRole.ADMIN]),
  asyncHandler(performanceController.getMonthlyReport.bind(performanceController))
);

// 获取律师绩效排名（仅财务和管理员）
router.get(
  '/reports/ranking',
  authenticateToken,
  requireRoles([UserRole.FINANCE, UserRole.ADMIN]),
  asyncHandler(performanceController.getRanking.bind(performanceController))
);

export default router;
