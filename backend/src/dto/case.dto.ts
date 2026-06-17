/**
 * 案件模块 DTO
 * 定义案件相关请求的验证规则
 */

import { z } from 'zod';
import { CaseStatus, CaseStage, BillingMode } from '@prisma/client';

/**
 * 创建案件请求 DTO
 */
export const createCaseDto = z.object({
  clientId: z.string().min(1, '客户ID不能为空'),
  title: z.string().min(1, '案件标题不能为空'),
  description: z.string().optional(),
  caseType: z.string().min(1, '案件类型不能为空'),
  billingMode: z.nativeEnum(BillingMode, { message: '收费模式无效' }),
  estimatedFee: z.number().nonnegative('预估费用不能为负数').optional(),
  contingencyRate: z.number().min(0).max(100, '风险比例不能超过100%').optional(),
  opposingParty: z.string().optional(),
  claimAmount: z.number().nonnegative('索赔金额不能为负数').optional(),
  court: z.string().optional(),
  caseNo: z.string().optional(),
  priority: z.string().optional()
});

export type CreateCaseDto = z.infer<typeof createCaseDto>;

/**
 * 更新案件请求 DTO
 */
export const updateCaseDto = z.object({
  title: z.string().min(1, '案件标题不能为空').optional(),
  description: z.string().optional(),
  caseType: z.string().optional(),
  status: z.nativeEnum(CaseStatus).optional(),
  currentStage: z.nativeEnum(CaseStage).optional(),
  priority: z.string().optional(),
  court: z.string().optional(),
  caseNo: z.string().optional(),
  opposingParty: z.string().optional(),
  claimAmount: z.number().nonnegative('索赔金额不能为负数').optional(),
  billingMode: z.nativeEnum(BillingMode).optional(),
  estimatedFee: z.number().nonnegative('预估费用不能为负数').optional(),
  contingencyRate: z.number().min(0).max(100, '风险比例不能超过100%').optional()
});

export type UpdateCaseDto = z.infer<typeof updateCaseDto>;

/**
 * 案件查询参数 DTO
 */
export const caseQueryDto = z.object({
  status: z.nativeEnum(CaseStatus).optional(),
  stage: z.nativeEnum(CaseStage).optional(),
  clientId: z.string().optional()
});

export type CaseQueryDto = z.infer<typeof caseQueryDto>;

/**
 * 案件阶段变更 DTO
 */
export const caseStageDto = z.object({
  stage: z.nativeEnum(CaseStage, { message: '案件阶段无效' }),
  notes: z.string().optional()
});

export type CaseStageDto = z.infer<typeof caseStageDto>;

/**
 * 律师分配 DTO
 */
export const lawyerAssignmentDto = z.object({
  lawyerId: z.string().min(1, '律师ID不能为空'),
  role: z.string().min(1, '角色不能为空'),
  allocation: z.number().min(0).max(100, '分配比例应在0-100之间'),
  isLead: z.boolean().default(false)
});

export type LawyerAssignmentDto = z.infer<typeof lawyerAssignmentDto>;

/**
 * 证据 DTO
 */
export const evidenceDto = z.object({
  name: z.string().min(1, '证据名称不能为空'),
  type: z.string().min(1, '证据类型不能为空'),
  description: z.string().optional(),
  source: z.string().optional(),
  receivedDate: z.string().optional(),
  status: z.string().default('已接收'),
  storedLocation: z.string().optional()
});

export type EvidenceDto = z.infer<typeof evidenceDto>;

/**
 * 开庭记录 DTO
 */
export const hearingDto = z.object({
  title: z.string().min(1, '开庭标题不能为空'),
  date: z.string().min(1, '开庭日期不能为空'),
  court: z.string().optional(),
  courtroom: z.string().optional(),
  judge: z.string().optional(),
  notes: z.string().optional(),
  outcome: z.string().optional()
});

export type HearingDto = z.infer<typeof hearingDto>;

/**
 * 工时记录 DTO
 */
export const timeEntryDto = z.object({
  lawyerId: z.string().optional(),
  date: z.string().optional(),
  hours: z.number().positive('工时必须为正数'),
  description: z.string().min(1, '工作描述不能为空'),
  taskType: z.string().optional(),
  rate: z.number().nonnegative('费率不能为负数'),
  isBillable: z.boolean().default(true)
});

export type TimeEntryDto = z.infer<typeof timeEntryDto>;

/**
 * 利益冲突审查 DTO
 */
export const conflictCheckDto = z.object({
  hasConflict: z.boolean(),
  conflictDetails: z.string().optional(),
  status: z.string().default('已完成'),
  checkedAt: z.string().optional()
});

export type ConflictCheckDto = z.infer<typeof conflictCheckDto>;

/**
 * 预支费用 DTO
 */
export const advanceFeeDto = z.object({
  description: z.string().min(1, '费用描述不能为空'),
  amount: z.number().positive('费用金额必须为正数')
});

export type AdvanceFeeDto = z.infer<typeof advanceFeeDto>;
