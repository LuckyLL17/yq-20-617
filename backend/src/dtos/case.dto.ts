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
  billingMode: z.nativeEnum(BillingMode, { message: '计费模式无效' }),
  estimatedFee: z.number().positive('预估费用必须为正数').optional(),
  contingencyRate: z.number().min(0).max(100, '风险代理比例应在0-100之间').optional(),
  opposingParty: z.string().optional(),
  claimAmount: z.number().positive('标的金额必须为正数').optional(),
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
  caseType: z.string().min(1, '案件类型不能为空').optional(),
  status: z.nativeEnum(CaseStatus).optional(),
  currentStage: z.nativeEnum(CaseStage).optional(),
  priority: z.string().optional(),
  court: z.string().optional(),
  caseNo: z.string().optional(),
  opposingParty: z.string().optional(),
  claimAmount: z.number().positive('标的金额必须为正数').optional(),
  billingMode: z.nativeEnum(BillingMode, { message: '计费模式无效' }).optional(),
  estimatedFee: z.number().positive('预估费用必须为正数').optional(),
  contingencyRate: z.number().min(0).max(100, '风险代理比例应在0-100之间').optional()
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
 * 阶段变更请求 DTO
 */
export const stageChangeDto = z.object({
  stage: z.nativeEnum(CaseStage, { message: '阶段无效' }),
  notes: z.string().optional()
});

export type StageChangeDto = z.infer<typeof stageChangeDto>;

/**
 * 律师分配请求 DTO
 */
export const lawyerAssignmentDto = z.object({
  lawyerId: z.string().min(1, '律师ID不能为空'),
  role: z.string().min(1, '角色不能为空'),
  allocation: z.number().min(0).max(100, '分配比例应在0-100之间'),
  isLead: z.boolean().optional()
});

export type LawyerAssignmentDto = z.infer<typeof lawyerAssignmentDto>;

/**
 * 证据创建请求 DTO
 */
export const evidenceCreateDto = z.object({
  name: z.string().min(1, '证据名称不能为空'),
  type: z.string().min(1, '证据类型不能为空'),
  description: z.string().optional(),
  source: z.string().optional(),
  receivedDate: z.string().optional(),
  status: z.string().optional(),
  storedLocation: z.string().optional()
});

export type EvidenceCreateDto = z.infer<typeof evidenceCreateDto>;

/**
 * 庭审创建请求 DTO
 */
export const hearingCreateDto = z.object({
  title: z.string().min(1, '庭审标题不能为空'),
  date: z.string().min(1, '庭审日期不能为空'),
  court: z.string().optional(),
  courtroom: z.string().optional(),
  judge: z.string().optional(),
  notes: z.string().optional(),
  outcome: z.string().optional()
});

export type HearingCreateDto = z.infer<typeof hearingCreateDto>;

/**
 * 工时记录创建请求 DTO
 */
export const timeEntryCreateDto = z.object({
  date: z.string().optional(),
  hours: z.number().positive('工时必须为正数'),
  description: z.string().min(1, '工作描述不能为空'),
  taskType: z.string().optional(),
  rate: z.number().positive('费率必须为正数').optional(),
  isBillable: z.boolean().optional(),
  lawyerId: z.string().optional()
});

export type TimeEntryCreateDto = z.infer<typeof timeEntryCreateDto>;

/**
 * 利益冲突检查请求 DTO
 */
export const conflictCheckDto = z.object({
  hasConflict: z.boolean(),
  conflictDetails: z.string().optional(),
  status: z.string().optional()
});

export type ConflictCheckDto = z.infer<typeof conflictCheckDto>;

/**
 * 预收费用创建请求 DTO
 */
export const advanceFeeCreateDto = z.object({
  description: z.string().min(1, '费用描述不能为空'),
  amount: z.number().positive('金额必须为正数')
});

export type AdvanceFeeCreateDto = z.infer<typeof advanceFeeCreateDto>;
