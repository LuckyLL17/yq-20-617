/**
 * 案件路由
 * 处理案件相关请求
 */

import { Router } from 'express';
import { caseController } from '../controllers/case.controller';
import { authenticateToken, requireRoles } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createCaseDto,
  updateCaseDto,
  caseQueryDto,
  caseStageDto,
  lawyerAssignmentDto,
  evidenceDto,
  hearingDto,
  timeEntryDto,
  conflictCheckDto,
  advanceFeeDto
} from '../dto/case.dto';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * @route GET /api/cases
 * @desc 获取案件列表
 * @access Private
 */
router.get(
  '/',
  authenticateToken,
  validateQuery(caseQueryDto),
  caseController.getAllCases
);

/**
 * @route GET /api/cases/stats
 * @desc 获取案件统计
 * @access Private
 */
router.get('/stats', authenticateToken, caseController.getCaseStats);

/**
 * @route GET /api/cases/:id
 * @desc 获取案件详情
 * @access Private
 */
router.get('/:id', authenticateToken, caseController.getCaseById);

/**
 * @route POST /api/cases
 * @desc 创建案件
 * @access Private
 */
router.post(
  '/',
  authenticateToken,
  validateBody(createCaseDto),
  caseController.createCase
);

/**
 * @route PUT /api/cases/:id
 * @desc 更新案件
 * @access Private
 */
router.put(
  '/:id',
  authenticateToken,
  validateBody(updateCaseDto),
  caseController.updateCase
);

/**
 * @route DELETE /api/cases/:id
 * @desc 删除案件
 * @access Private (Admin)
 */
router.delete(
  '/:id',
  authenticateToken,
  requireRoles([UserRole.ADMIN]),
  caseController.deleteCase
);

/**
 * @route POST /api/cases/:id/stage
 * @desc 更新案件阶段
 * @access Private
 */
router.post(
  '/:id/stage',
  authenticateToken,
  validateBody(caseStageDto),
  caseController.updateCaseStage
);

/**
 * @route POST /api/cases/:id/lawyers
 * @desc 分配律师
 * @access Private
 */
router.post(
  '/:id/lawyers',
  authenticateToken,
  validateBody(lawyerAssignmentDto),
  caseController.assignLawyer
);

/**
 * @route DELETE /api/cases/:id/lawyers/:assignmentId
 * @desc 移除律师分配
 * @access Private
 */
router.delete(
  '/:id/lawyers/:assignmentId',
  authenticateToken,
  caseController.removeLawyerAssignment
);

/**
 * @route POST /api/cases/:id/evidence
 * @desc 添加证据
 * @access Private
 */
router.post(
  '/:id/evidence',
  authenticateToken,
  validateBody(evidenceDto),
  caseController.addEvidence
);

/**
 * @route POST /api/cases/:id/hearings
 * @desc 添加开庭记录
 * @access Private
 */
router.post(
  '/:id/hearings',
  authenticateToken,
  validateBody(hearingDto),
  caseController.addHearing
);

/**
 * @route POST /api/cases/:id/time-entries
 * @desc 添加工时记录
 * @access Private
 */
router.post(
  '/:id/time-entries',
  authenticateToken,
  validateBody(timeEntryDto),
  caseController.addTimeEntry
);

/**
 * @route POST /api/cases/:id/conflict-check
 * @desc 创建利益冲突审查
 * @access Private
 */
router.post(
  '/:id/conflict-check',
  authenticateToken,
  validateBody(conflictCheckDto),
  caseController.createConflictCheck
);

/**
 * @route POST /api/cases/:id/advance-fees
 * @desc 添加预支费用
 * @access Private
 */
router.post(
  '/:id/advance-fees',
  authenticateToken,
  validateBody(advanceFeeDto),
  caseController.addAdvanceFee
);

export default router;
