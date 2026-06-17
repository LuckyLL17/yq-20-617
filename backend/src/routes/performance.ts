import { Router } from 'express';
import { prisma } from '../index';
import { authenticateToken, requireRoles, AuthRequest } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { calculatePerformanceShares, generatePerformanceReport } from '../utils/performanceCalculator';

const router = Router();

router.post('/calculate/:caseId', authenticateToken, requireRoles([UserRole.FINANCE, UserRole.ADMIN]), async (req, res) => {
  const caseId = req.params.caseId;
  const { totalFee } = req.body;

  const caseItem = await prisma.legalCase.findUnique({
    where: { id: caseId },
    include: {
      timeEntries: true,
      lawyerAssignments: {
        include: { lawyer: { select: { id: true, name: true } } }
      }
    }
  });

  if (!caseItem) {
    return res.status(404).json({ error: '案件不存在' });
  }

  const shares = calculatePerformanceShares(
    caseItem.timeEntries,
    caseItem.lawyerAssignments,
    totalFee
  );

  res.json(shares);
});

router.post('/save/:caseId', authenticateToken, requireRoles([UserRole.FINANCE, UserRole.ADMIN]), async (req, res) => {
  const caseId = req.params.caseId;
  const { shares } = req.body;

  await prisma.performanceShare.deleteMany({
    where: { caseId }
  });

  const savedShares = await Promise.all(
    shares.map((share: any) =>
      prisma.performanceShare.create({
        data: {
          caseId,
          lawyerId: share.lawyerId,
          totalHours: share.totalHours,
          shareRatio: share.shareRatio,
          contribution: share.contribution,
          allocatedFee: share.allocatedFee,
          calculatedAt: new Date()
        },
        include: { lawyer: { select: { id: true, name: true } } }
      })
    )
  );

  res.status(201).json(savedShares);
});

router.get('/case/:caseId', authenticateToken, async (req, res) => {
  const shares = await prisma.performanceShare.findMany({
    where: { caseId: req.params.caseId },
    include: { lawyer: { select: { id: true, name: true } } },
    orderBy: { shareRatio: 'desc' }
  });
  res.json(shares);
});

router.get('/lawyer/:lawyerId', authenticateToken, async (req, res) => {
  const { startDate, endDate } = req.query;
  const where: any = { lawyerId: req.params.lawyerId };

  if (startDate && endDate) {
    where.calculatedAt = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string)
    };
  }

  const shares = await prisma.performanceShare.findMany({
    where,
    include: {
      caseItem: { select: { id: true, caseNumber: true, title: true } }
    },
    orderBy: { calculatedAt: 'desc' }
  });

  const totalFee = shares.reduce((sum, s) => sum + s.allocatedFee.toNumber(), 0);
  const totalHours = shares.reduce((sum, s) => sum + s.totalHours.toNumber(), 0);

  res.json({
    shares,
    summary: {
      totalCases: shares.length,
      totalFee,
      totalHours,
      averageHourlyRate: totalHours > 0 ? totalFee / totalHours : 0
    }
  });
});

router.get('/reports/monthly', authenticateToken, requireRoles([UserRole.FINANCE, UserRole.ADMIN]), async (req, res) => {
  const { month, year } = req.query;

  const startDate = new Date(Number(year), Number(month) - 1, 1);
  const endDate = new Date(Number(year), Number(month), 0);

  const shares = await prisma.performanceShare.findMany({
    where: {
      calculatedAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: { lawyer: { select: { id: true, name: true } } }
  });

  const report = generatePerformanceReport(shares as any, { start: startDate, end: endDate });
  res.json(report);
});

router.get('/reports/ranking', authenticateToken, requireRoles([UserRole.FINANCE, UserRole.ADMIN]), async (req, res) => {
  const { startDate, endDate, limit = 10 } = req.query;

  const where: any = {};
  if (startDate && endDate) {
    where.calculatedAt = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string)
    };
  }

  const shares = await prisma.performanceShare.findMany({
    where,
    include: { lawyer: { select: { id: true, name: true } } }
  });

  const lawyerStats = new Map<string, any>();

  for (const share of shares) {
    const existing = lawyerStats.get(share.lawyerId) || {
      lawyerId: share.lawyerId,
      lawyerName: (share.lawyer as any).name,
      totalCases: 0,
      totalHours: 0,
      totalFee: 0
    };

    existing.totalCases += 1;
    existing.totalHours += share.totalHours.toNumber();
    existing.totalFee += share.allocatedFee.toNumber();

    lawyerStats.set(share.lawyerId, existing);
  }

  const ranking = Array.from(lawyerStats.values())
    .sort((a, b) => b.totalFee - a.totalFee)
    .slice(0, Number(limit))
    .map((item, index) => ({
      rank: index + 1,
      ...item,
      averageHourlyRate: item.totalHours > 0 ? item.totalFee / item.totalHours : 0
    }));

  res.json(ranking);
});

export default router;
