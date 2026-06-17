import { z } from 'zod';
import { CaseStatus, CaseStage, BillingMode } from '@prisma/client';

/**
 * 创建案件 DTO
 */
export const CreateCaseDto = z.object({
  /** 客户 ID */
  clientId: z.string().min(1, { message: '客户ID不能为空' }),
  /** 案件标题 */
  title: z.string().min(1, { message: '案件标题不能为空' }),
  /** 案件描述 */
  description: z.string().optional(),
  /** 案件类型 */
  caseType: z.string().min(1, { message: '案件类型不能为空' }),
  /** 计费方式 */
  billingMode: z.nativeEnum(BillingMode, { message: '计费方式无效' }),
  /** 预估费用 */
  estimatedFee: z.number().positive().optional(),
  /** 风险代理费率 */
  contingencyRate: z.number().positive().optional(),
  /** 对方当事人 */
  opposingParty: z.string().optional(),
  /** 诉讼标的额 */
  claimAmount: z.number().positive().optional(),
  /** 法院 */
  court: z.string().optional(),
  /** 案号 */
  caseNo: z.string().optional(),
  /** 优先级 */
  priority: z.string().optional()
});

/**
 * 更新案件 DTO
 */
export const UpdateCaseDto = z.object({
  /** 案件标题 */
  title: z.string().min(1, { message: '案件标题不能为空' }).optional(),
  /** 案件描述 */
  description: z.string().optional(),
  /** 案件类型 */
  caseType: z.string().min(1, { message: '案件类型不能为空' }).optional(),
  /** 案件状态 */
  status: z.nativeEnum(CaseStatus, { message: '案件状态无效' }).optional(),
  /** 当前阶段 */
  currentStage: z.nativeEnum(CaseStage, { message: '案件阶段无效' }).optional(),
  /** 计费方式 */
  billingMode: z.nativeEnum(BillingMode, { message: '计费方式无效' }).optional(),
  /** 预估费用 */
  estimatedFee: z.number().positive().optional(),
  /** 风险代理费率 */
  contingencyRate: z.number().positive().optional(),
  /** 对方当事人 */
  opposingParty: z.string().optional(),
  /** 诉讼标的额 */
  claimAmount: z.number().positive().optional(),
  /** 法院 */
  court: z.string().optional(),
  /** 案号 */
  caseNo: z.string().optional(),
  /** 优先级 */
  priority: z.string().optional()
});

/**
 * 案件查询参数 DTO
 */
export const CaseQueryDto = z.object({
  /** 状态过滤 */
  status: z.nativeEnum(CaseStatus).optional(),
  /** 阶段过滤 */
  stage: z.nativeEnum(CaseStage).optional(),
  /** 客户ID过滤 */
  clientId: z.string().optional(),
  /** 关键词搜索 */
  keyword: z.string().optional(),
  /** 页码 */
  page: z.coerce.number().int().positive().optional().default(1),
  /** 每页数量 */
  pageSize: z.coerce.number().int().positive().max(100).optional().default(10)
});

/**
 * 更新案件阶段 DTO
 */
export const UpdateCaseStageDto = z.object({
  /** 新阶段 */
  stage: z.nativeEnum(CaseStage, { message: '案件阶段无效' }),
  /** 备注 */
  notes: z.string().optional()
});

/**
 * 分配律师 DTO
 */
export const AssignLawyerDto = z.object({
  /** 律师ID */
  lawyerId: z.string().min(1, { message: '律师ID不能为空' }),
  /** 角色 */
  role: z.string().min(1, { message: '角色不能为空' }),
  /** 分配比例 */
  allocation: z.number().positive({ message: '分配比例必须为正数' }),
  /** 是否为主办律师 */
  isLead: z.boolean().optional().default(false)
});

/**
 * 添加证据 DTO
 */
export const AddEvidenceDto = z.object({
  /** 证据名称 */
  name: z.string().min(1, { message: '证据名称不能为空' }),
  /** 证据类型 */
  type: z.string().min(1, { message: '证据类型不能为空' }),
  /** 描述 */
  description: z.string().optional(),
  /** 来源 */
  source: z.string().optional(),
  /** 收到日期 */
  receivedDate: z.coerce.date().optional(),
  /** 状态 */
  status: z.string().optional(),
  /** 存储位置 */
  storedLocation: z.string().optional()
});

/**
 * 添加庭审 DTO
 */
export const AddHearingDto = z.object({
  /** 庭审标题 */
  title: z.string().min(1, { message: '庭审标题不能为空' }),
  /** 庭审日期 */
  date: z.coerce.date({ message: '日期格式不正确' }),
  /** 法院 */
  court: z.string().optional(),
  /** 法庭 */
  courtroom: z.string().optional(),
  /** 法官 */
  judge: z.string().optional(),
  /** 备注 */
  notes: z.string().optional(),
  /** 结果 */
  outcome: z.string().optional()
});

/**
 * 添加工时记录 DTO
 */
export const AddTimeEntryDto = z.object({
  /** 律师ID */
  lawyerId: z.string().optional(),
  /** 日期 */
  date: z.coerce.date().optional(),
  /** 工时（小时） */
  hours: z.number().positive({ message: '工时必须为正数' }),
  /** 工作描述 */
  description: z.string().min(1, { message: '工作描述不能为空' }),
  /** 任务类型 */
  taskType: z.string().optional(),
  /** 费率 */
  rate: z.number().positive({ message: '费率必须为正数' }),
  /** 是否可计费 */
  isBillable: z.boolean().optional().default(true)
});

/**
 * 冲突检查 DTO
 */
export const ConflictCheckDto = z.object({
  /** 是否有冲突 */
  hasConflict: z.boolean(),
  /** 冲突详情 */
  conflictDetails: z.string().optional(),
  /** 检查状态 */
  status: z.string().min(1, { message: '状态不能为空' }),
  /** 检查时间 */
  checkedAt: z.coerce.date().optional()
});

/**
 * 添加预付费 DTO
 */
export const AddAdvanceFeeDto = z.object({
  /** 描述 */
  description: z.string().min(1, { message: '描述不能为空' }),
  /** 金额 */
  amount: z.number().positive({ message: '金额必须为正数' })
});

export type CreateCaseDtoType = z.infer<typeof CreateCaseDto>;
export type UpdateCaseDtoType = z.infer<typeof UpdateCaseDto>;
export type CaseQueryDtoType = z.infer<typeof CaseQueryDto>;
export type UpdateCaseStageDtoType = z.infer<typeof UpdateCaseStageDto>;
export type AssignLawyerDtoType = z.infer<typeof AssignLawyerDto>;
export type AddEvidenceDtoType = z.infer<typeof AddEvidenceDto>;
export type AddHearingDtoType = z.infer<typeof AddHearingDto>;
export type AddTimeEntryDtoType = z.infer<typeof AddTimeEntryDto>;
export type ConflictCheckDtoType = z.infer<typeof ConflictCheckDto>;
export type AddAdvanceFeeDtoType = z.infer<typeof AddAdvanceFeeDto>;
