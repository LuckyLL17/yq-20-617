import { prisma } from './prisma';
import { CaseStage, CaseStatus } from '@prisma/client';

export class CaseRepository {
  async findMany(where: any) {
    return prisma.legalCase.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        lawyerAssignments: {
          include: { lawyer: { select: { id: true, name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findStats() {
    const total = await prisma.legalCase.count();
    const byStatus = await prisma.legalCase.groupBy({
      by: ['status'],
      _count: true
    });
    const byStage = await prisma.legalCase.groupBy({
      by: ['currentStage'],
      _count: true
    });
    return { total, byStatus, byStage };
  }

  async findById(id: string) {
    return prisma.legalCase.findUnique({
      where: { id },
      include: {
        client: true,
        createdBy: { select: { id: true, name: true, email: true } },
        stageHistory: { orderBy: { startedAt: 'desc' } },
        lawyerAssignments: {
          include: { lawyer: { select: { id: true, name: true, email: true } } }
        },
        evidence: true,
        hearings: { orderBy: { date: 'asc' } },
        timeEntries: {
          include: { lawyer: { select: { id: true, name: true } } },
          orderBy: { date: 'desc' }
        },
        invoices: {
          include: { items: true, payments: true },
          orderBy: { createdAt: 'desc' }
        },
        payments: { orderBy: { paymentDate: 'desc' } },
        advanceFees: { orderBy: { createdAt: 'desc' } },
        performanceShares: {
          include: { lawyer: { select: { id: true, name: true } } }
        },
        conflictCheck: true,
        documents: true
      }
    });
  }

  async findByIdWithTimeEntries(id: string) {
    return prisma.legalCase.findUnique({
      where: { id },
      include: { timeEntries: true }
    });
  }

  async findByIdWithAssignments(id: string) {
    return prisma.legalCase.findUnique({
      where: { id },
      include: {
        timeEntries: true,
        lawyerAssignments: {
          include: { lawyer: { select: { id: true, name: true } } }
        }
      }
    });
  }

  async create(data: any) {
    return prisma.legalCase.create({
      data,
      include: {
        client: { select: { id: true, name: true } },
        stageHistory: true
      }
    });
  }

  async update(id: string, data: any) {
    return prisma.legalCase.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.legalCase.delete({ where: { id } });
  }

  async closeCurrentStage(caseId: string) {
    return prisma.stageHistory.updateMany({
      where: { caseId, endedAt: null },
      data: { endedAt: new Date() }
    });
  }

  async createStageHistory(data: any) {
    return prisma.stageHistory.create({ data });
  }

  async updateStage(caseId: string, currentStage: CaseStage, status: CaseStatus, closedAt?: Date | null) {
    return prisma.legalCase.update({
      where: { id: caseId },
      data: { currentStage, status, closedAt: closedAt || null }
    });
  }

  async createLawyerAssignment(data: any) {
    return prisma.lawyerAssignment.create({
      data,
      include: { lawyer: { select: { id: true, name: true } } }
    });
  }

  async deleteLawyerAssignment(assignmentId: string) {
    return prisma.lawyerAssignment.delete({ where: { id: assignmentId } });
  }

  async createEvidence(data: any) {
    return prisma.evidence.create({ data });
  }

  async createHearing(data: any) {
    return prisma.hearing.create({ data });
  }

  async createTimeEntry(data: any) {
    return prisma.timeEntry.create({
      data,
      include: { lawyer: { select: { id: true, name: true } } }
    });
  }

  async createConflictCheck(data: any) {
    return prisma.conflictCheck.create({ data });
  }

  async createAdvanceFee(data: any) {
    return prisma.advanceFee.create({ data });
  }
}
