import { z } from 'zod';
import { CaseStage, CaseStatus, BillingMode } from '@prisma/client';

export const createCaseDto = z.object({
  clientId: z.string().min(1, '客户ID不能为空'),
  title: z.string().min(1, '案件标题不能为空'),
  description: z.string().optional(),
  caseType: z.string().min(1, '案件类型不能为空'),
  billingMode: z.nativeEnum(BillingMode, { errorMap: () => ({ message: '无效的计费模式' }) }),
  estimatedFee: z.number().positive().optional(),
  contingencyRate: z.number().min(0).max(100).optional(),
  opposingParty: z.string().optional(),
  claimAmount: z.number().positive().optional(),
  court: z.string().optional(),
  caseNo: z.string().optional(),
  priority: z.string().optional()
});

export type CreateCaseDto = z.infer<typeof createCaseDto>;

export const updateCaseDto = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  caseType: z.string().optional(),
  status: z.nativeEnum(CaseStatus).optional(),
  currentStage: z.nativeEnum(CaseStage).optional(),
  priority: z.string().optional(),
  court: z.string().optional(),
  caseNo: z.string().optional(),
  opposingParty: z.string().optional(),
  claimAmount: z.number().positive().optional(),
  billingMode: z.nativeEnum(BillingMode).optional(),
  estimatedFee: z.number().positive().optional(),
  contingencyRate: z.number().min(0).max(100).optional()
});

export type UpdateCaseDto = z.infer<typeof updateCaseDto>;

export const advanceStageDto = z.object({
  stage: z.nativeEnum(CaseStage, { errorMap: () => ({ message: '无效的案件阶段' }) }),
  notes: z.string().optional()
});

export type AdvanceStageDto = z.infer<typeof advanceStageDto>;

export const assignLawyerDto = z.object({
  lawyerId: z.string().min(1, '律师ID不能为空'),
  role: z.string().min(1, '角色不能为空'),
  allocation: z.number().min(0).max(100),
  isLead: z.boolean().optional().default(false)
});

export type AssignLawyerDto = z.infer<typeof assignLawyerDto>;

export const createEvidenceDto = z.object({
  name: z.string().min(1, '证据名称不能为空'),
  type: z.string().min(1, '证据类型不能为空'),
  description: z.string().optional(),
  source: z.string().optional(),
  receivedDate: z.string().optional(),
  status: z.string().min(1, '状态不能为空'),
  storedLocation: z.string().optional(),
  uploadedById: z.string().optional()
});

export type CreateEvidenceDto = z.infer<typeof createEvidenceDto>;

export const createHearingDto = z.object({
  title: z.string().min(1, '听证会标题不能为空'),
  date: z.string().min(1, '日期不能为空'),
  court: z.string().optional(),
  courtroom: z.string().optional(),
  judge: z.string().optional(),
  notes: z.string().optional(),
  outcome: z.string().optional()
});

export type CreateHearingDto = z.infer<typeof createHearingDto>;

export const createTimeEntryDto = z.object({
  lawyerId: z.string().optional(),
  date: z.string().optional(),
  hours: z.number().positive('工时必须为正数'),
  description: z.string().min(1, '描述不能为空'),
  taskType: z.string().optional(),
  rate: z.number().positive('费率必须为正数'),
  isBillable: z.boolean().optional().default(true)
});

export type CreateTimeEntryDto = z.infer<typeof createTimeEntryDto>;

export const createConflictCheckDto = z.object({
  hasConflict: z.boolean(),
  conflictDetails: z.string().optional(),
  status: z.string().min(1, '状态不能为空'),
  checkedAt: z.string().optional()
});

export type CreateConflictCheckDto = z.infer<typeof createConflictCheckDto>;

export const createAdvanceFeeDto = z.object({
  description: z.string().min(1, '描述不能为空'),
  amount: z.number().positive('金额必须为正数')
});

export type CreateAdvanceFeeDto = z.infer<typeof createAdvanceFeeDto>;

export const caseQueryDto = z.object({
  status: z.nativeEnum(CaseStatus).optional(),
  stage: z.nativeEnum(CaseStage).optional(),
  clientId: z.string().optional()
});

export type CaseQueryDto = z.infer<typeof caseQueryDto>;
