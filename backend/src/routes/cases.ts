import { Router } from 'express';
import { prisma } from '../index';
import { authenticateToken, requireRoles, AuthRequest } from '../middleware/auth';
import { CaseStage, CaseStatus, UserRole } from '@prisma/client';

const router = Router();

function generateCaseNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CASE-${year}-${random}`;
}

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  const { status, stage, clientId } = req.query;
  const where: any = {};

  if (status) where.status = status;
  if (stage) where.currentStage = stage;
  if (clientId) where.clientId = clientId;

  if (req.user?.role === UserRole.CLIENT) {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    if (user) {
      const client = await prisma.client.findFirst({
        where: { email: user.email }
      });
      if (client) {
        where.clientId = client.id;
      }
    }
  }

  const cases = await prisma.legalCase.findMany({
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
  res.json(cases);
});

router.get('/stats', authenticateToken, async (req, res) => {
  const total = await prisma.legalCase.count();
  const byStatus = await prisma.legalCase.groupBy({
    by: ['status'],
    _count: true
  });
  const byStage = await prisma.legalCase.groupBy({
    by: ['currentStage'],
    _count: true
  });
  res.json({ total, byStatus, byStage });
});

router.get('/:id', authenticateToken, async (req, res) => {
  const caseItem = await prisma.legalCase.findUnique({
    where: { id: req.params.id },
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
  if (!caseItem) {
    return res.status(404).json({ error: '案件不存在' });
  }
  res.json(caseItem);
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { clientId, title, description, caseType, billingMode, estimatedFee, contingencyRate, opposingParty, claimAmount, court, caseNo, priority } = req.body;

    if (!title || !clientId || !caseType || !billingMode) {
      return res.status(400).json({ error: '缺少必填字段: title, clientId, caseType, billingMode' });
    }

    const caseItem = await prisma.legalCase.create({
      data: {
        caseNumber: generateCaseNumber(),
        title,
        description: description || null,
        caseType,
        status: CaseStatus.CONSULTATION,
        currentStage: CaseStage.CONSULTATION,
        priority: priority || null,
        court: court || null,
        caseNo: caseNo || null,
        opposingParty: opposingParty || null,
        claimAmount: claimAmount || null,
        clientId,
        createdById: req.user!.id,
        billingMode,
        estimatedFee: estimatedFee || null,
        contingencyRate: contingencyRate || null,
        stageHistory: {
          create: {
            stage: CaseStage.CONSULTATION,
            operatorId: req.user!.id
          }
        }
      },
      include: {
        client: { select: { id: true, name: true } },
        stageHistory: true
      }
    });
    res.status(201).json(caseItem);
  } catch (error: any) {
    res.status(400).json({ error: error.message || '创建案件失败' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const caseItem = await prisma.legalCase.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(caseItem);
  } catch (error: any) {
    res.status(400).json({ error: error.message || '更新案件失败' });
  }
});

router.post('/:id/stage', authenticateToken, async (req: AuthRequest, res) => {
  const { stage, notes } = req.body;
  const caseId = req.params.id;

  await prisma.stageHistory.updateMany({
    where: { caseId, endedAt: null },
    data: { endedAt: new Date() }
  });

  const history = await prisma.stageHistory.create({
    data: {
      caseId,
      stage,
      notes,
      operatorId: req.user!.id
    }
  });

  const statusMap: Record<string, CaseStatus> = {
    [CaseStage.CONSULTATION]: CaseStatus.CONSULTATION,
    [CaseStage.CONFLICT_CHECK]: CaseStatus.CONFLICT_CHECK,
    [CaseStage.APPROVAL]: CaseStatus.PENDING_APPROVAL,
    [CaseStage.COURT_HEARING]: CaseStatus.COURT_HEARING,
    [CaseStage.SETTLEMENT]: CaseStatus.SETTLEMENT,
    [CaseStage.ARCHIVE]: CaseStatus.CLOSED
  };

  await prisma.legalCase.update({
    where: { id: caseId },
    data: {
      currentStage: stage,
      status: statusMap[stage] || CaseStatus.ACTIVE,
      closedAt: stage === CaseStage.ARCHIVE ? new Date() : null
    }
  });

  res.json(history);
});

router.post('/:id/lawyers', authenticateToken, async (req, res) => {
  const { lawyerId, role, allocation, isLead } = req.body;
  const assignment = await prisma.lawyerAssignment.create({
    data: {
      caseId: req.params.id,
      lawyerId,
      role,
      allocation,
      isLead
    },
    include: { lawyer: { select: { id: true, name: true } } }
  });
  res.status(201).json(assignment);
});

router.delete('/:id/lawyers/:assignmentId', authenticateToken, async (req, res) => {
  await prisma.lawyerAssignment.delete({
    where: { id: req.params.assignmentId }
  });
  res.json({ message: '已移除律师分配' });
});

router.post('/:id/evidence', authenticateToken, async (req, res) => {
  const evidence = await prisma.evidence.create({
    data: {
      caseId: req.params.id,
      ...req.body
    }
  });
  res.status(201).json(evidence);
});

router.post('/:id/hearings', authenticateToken, async (req, res) => {
  const hearing = await prisma.hearing.create({
    data: {
      caseId: req.params.id,
      ...req.body
    }
  });
  res.status(201).json(hearing);
});

router.post('/:id/time-entries', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { date, ...rest } = req.body;
    const timeEntry = await prisma.timeEntry.create({
      data: {
        caseId: req.params.id,
        lawyerId: rest.lawyerId || req.user!.id,
        ...rest,
        date: date ? new Date(date) : new Date()
      },
      include: { lawyer: { select: { id: true, name: true } } }
    });
    res.status(201).json(timeEntry);
  } catch (error: any) {
    res.status(400).json({ error: error.message || '创建工时记录失败' });
  }
});

router.post('/:id/conflict-check', authenticateToken, async (req: AuthRequest, res) => {
  const conflictCheck = await prisma.conflictCheck.create({
    data: {
      caseId: req.params.id,
      checkedById: req.user!.id,
      ...req.body
    }
  });
  res.status(201).json(conflictCheck);
});

router.post('/:id/advance-fees', authenticateToken, async (req: AuthRequest, res) => {
  const advanceFee = await prisma.advanceFee.create({
    data: {
      caseId: req.params.id,
      createdById: req.user!.id,
      ...req.body
    }
  });
  res.status(201).json(advanceFee);
});

router.delete('/:id', authenticateToken, requireRoles([UserRole.ADMIN]), async (req, res) => {
  await prisma.legalCase.delete({
    where: { id: req.params.id }
  });
  res.json({ message: '案件已删除' });
});

export default router;
