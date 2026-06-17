import { CaseRepository } from '../repositories/case.repository';
import { UserRepository } from '../repositories/user.repository';
import { ClientRepository } from '../repositories/client.repository';
import { NotFoundError } from '../types/errors';
import { CaseStage, CaseStatus, UserRole } from '@prisma/client';
import {
  CreateCaseDto,
  UpdateCaseDto,
  AdvanceStageDto,
  AssignLawyerDto,
  CreateEvidenceDto,
  CreateHearingDto,
  CreateTimeEntryDto,
  CreateConflictCheckDto,
  CreateAdvanceFeeDto
} from '../dto/case.dto';

type AuthUser = NonNullable<import('express-serve-static-core').Request['user']>;

const caseRepo = new CaseRepository();
const userRepo = new UserRepository();
const clientRepo = new ClientRepository();

function generateCaseNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CASE-${year}-${random}`;
}

const stageToStatusMap: Record<string, CaseStatus> = {
  [CaseStage.CONSULTATION]: CaseStatus.CONSULTATION,
  [CaseStage.CONFLICT_CHECK]: CaseStatus.CONFLICT_CHECK,
  [CaseStage.APPROVAL]: CaseStatus.PENDING_APPROVAL,
  [CaseStage.COURT_HEARING]: CaseStatus.COURT_HEARING,
  [CaseStage.SETTLEMENT]: CaseStatus.SETTLEMENT,
  [CaseStage.ARCHIVE]: CaseStatus.CLOSED
};

export class CaseService {
  async findMany(query: any, user: AuthUser) {
    const where: any = {};

    if (query.status) where.status = query.status;
    if (query.stage) where.currentStage = query.stage;
    if (query.clientId) where.clientId = query.clientId;

    if (user.role === UserRole.CLIENT) {
      const userRecord = await userRepo.findByUsername(user.username);
      if (userRecord) {
        const client = await clientRepo.findByEmail(userRecord.email);
        if (client) {
          where.clientId = client.id;
        }
      }
    }

    return caseRepo.findMany(where);
  }

  async findStats() {
    return caseRepo.findStats();
  }

  async findById(id: string) {
    const caseItem = await caseRepo.findById(id);
    if (!caseItem) {
      throw new NotFoundError('案件不存在');
    }
    return caseItem;
  }

  async create(dto: CreateCaseDto, user: AuthUser) {
    return caseRepo.create({
      caseNumber: generateCaseNumber(),
      title: dto.title,
      description: dto.description || null,
      caseType: dto.caseType,
      status: CaseStatus.CONSULTATION,
      currentStage: CaseStage.CONSULTATION,
      priority: dto.priority || null,
      court: dto.court || null,
      caseNo: dto.caseNo || null,
      opposingParty: dto.opposingParty || null,
      claimAmount: dto.claimAmount || null,
      clientId: dto.clientId,
      createdById: user.id,
      billingMode: dto.billingMode,
      estimatedFee: dto.estimatedFee || null,
      contingencyRate: dto.contingencyRate || null,
      stageHistory: {
        create: {
          stage: CaseStage.CONSULTATION,
          operatorId: user.id
        }
      }
    });
  }

  async update(id: string, dto: UpdateCaseDto) {
    return caseRepo.update(id, dto);
  }

  async advanceStage(caseId: string, dto: AdvanceStageDto, user: AuthUser) {
    await caseRepo.closeCurrentStage(caseId);

    const history = await caseRepo.createStageHistory({
      caseId,
      stage: dto.stage,
      notes: dto.notes,
      operatorId: user.id
    });

    const newStatus = stageToStatusMap[dto.stage] || CaseStatus.ACTIVE;
    const closedAt = dto.stage === CaseStage.ARCHIVE ? new Date() : null;
    await caseRepo.updateStage(caseId, dto.stage, newStatus, closedAt);

    return history;
  }

  async assignLawyer(caseId: string, dto: AssignLawyerDto) {
    return caseRepo.createLawyerAssignment({
      caseId,
      lawyerId: dto.lawyerId,
      role: dto.role,
      allocation: dto.allocation,
      isLead: dto.isLead
    });
  }

  async removeLawyerAssignment(assignmentId: string) {
    return caseRepo.deleteLawyerAssignment(assignmentId);
  }

  async addEvidence(caseId: string, dto: CreateEvidenceDto) {
    return caseRepo.createEvidence({ caseId, ...dto });
  }

  async addHearing(caseId: string, dto: CreateHearingDto) {
    return caseRepo.createHearing({ caseId, ...dto });
  }

  async addTimeEntry(caseId: string, dto: CreateTimeEntryDto, user: AuthUser) {
    const { date, ...rest } = dto;
    return caseRepo.createTimeEntry({
      caseId,
      lawyerId: rest.lawyerId || user.id,
      ...rest,
      date: date ? new Date(date) : new Date()
    });
  }

  async addConflictCheck(caseId: string, dto: CreateConflictCheckDto, user: AuthUser) {
    return caseRepo.createConflictCheck({
      caseId,
      checkedById: user.id,
      ...dto
    });
  }

  async addAdvanceFee(caseId: string, dto: CreateAdvanceFeeDto, user: AuthUser) {
    return caseRepo.createAdvanceFee({
      caseId,
      createdById: user.id,
      ...dto
    });
  }

  async delete(id: string) {
    return caseRepo.delete(id);
  }
}
