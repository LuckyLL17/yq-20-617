import { Router } from 'express';
import { caseController } from '../controllers/case.controller';
import { authenticateToken, requireRoles } from '../middleware/auth';
import { asyncHandler, validateBody } from '../middleware/validate';
import {
  createCaseDto,
  updateCaseDto,
  stageChangeDto,
  lawyerAssignmentDto,
  evidenceCreateDto,
  hearingCreateDto,
  timeEntryCreateDto,
  conflictCheckDto,
  advanceFeeCreateDto
} from '../dtos/case.dto';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * 案件路由
 * 处理案件相关请求
 */

// 获取案件列表
router.get(
  '/',
  authenticateToken,
  asyncHandler(caseController.getCases.bind(caseController))
);

// 获取案件统计数据
router.get(
  '/stats',
  authenticateToken,
  asyncHandler(caseController.getCaseStats.bind(caseController))
);

// 获取案件详情
router.get(
  '/:id',
  authenticateToken,
  asyncHandler(caseController.getCaseById.bind(caseController))
);

// 创建案件
router.post(
  '/',
  authenticateToken,
  validateBody(createCaseDto),
  asyncHandler(caseController.createCase.bind(caseController))
);

// 更新案件
router.put(
  '/:id',
  authenticateToken,
  validateBody(updateCaseDto),
  asyncHandler(caseController.updateCase.bind(caseController))
);

// 删除案件（仅管理员）
router.delete(
  '/:id',
  authenticateToken,
  requireRoles([UserRole.ADMIN]),
  asyncHandler(caseController.deleteCase.bind(caseController))
);

// 变更案件阶段
router.post(
  '/:id/stage',
  authenticateToken,
  validateBody(stageChangeDto),
  asyncHandler(caseController.changeStage.bind(caseController))
);

// 分配律师
router.post(
  '/:id/lawyers',
  authenticateToken,
  validateBody(lawyerAssignmentDto),
  asyncHandler(caseController.assignLawyer.bind(caseController))
);

// 移除律师分配
router.delete(
  '/:id/lawyers/:assignmentId',
  authenticateToken,
  asyncHandler(caseController.removeLawyerAssignment.bind(caseController))
);

// 添加证据
router.post(
  '/:id/evidence',
  authenticateToken,
  validateBody(evidenceCreateDto),
  asyncHandler(caseController.addEvidence.bind(caseController))
);

// 添加庭审
router.post(
  '/:id/hearings',
  authenticateToken,
  validateBody(hearingCreateDto),
  asyncHandler(caseController.addHearing.bind(caseController))
);

// 添加工时记录
router.post(
  '/:id/time-entries',
  authenticateToken,
  validateBody(timeEntryCreateDto),
  asyncHandler(caseController.addTimeEntry.bind(caseController))
);

// 创建利益冲突检查
router.post(
  '/:id/conflict-check',
  authenticateToken,
  validateBody(conflictCheckDto),
  asyncHandler(caseController.createConflictCheck.bind(caseController))
);

// 添加预收费用
router.post(
  '/:id/advance-fees',
  authenticateToken,
  validateBody(advanceFeeCreateDto),
  asyncHandler(caseController.addAdvanceFee.bind(caseController))
);

export default router;
