import { Router } from 'express';
import { prisma } from '../index';
import { authenticateToken, requireRoles, AuthRequest } from '../middleware/auth';
import { FeeType, PaymentStatus, UserRole } from '@prisma/client';
import { calculateBillingFee, standardProgressiveTiers } from '../utils/billingCalculator';

const router = Router();

function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `INV-${year}-${random}`;
}

router.get('/invoices', authenticateToken, async (req, res) => {
  const { status, caseId } = req.query;
  const where: any = {};
  if (status) where.status = status;
  if (caseId) where.caseId = caseId;

  const invoices = await prisma.invoice.findMany({
    where,
    include: {
      caseItem: { select: { id: true, caseNumber: true, title: true } },
      items: true,
      payments: true
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(invoices);
});

router.get('/invoices/:id', authenticateToken, async (req, res) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: req.params.id },
    include: {
      caseItem: true,
      items: true,
      payments: true
    }
  });
  if (!invoice) {
    return res.status(404).json({ error: '发票不存在' });
  }
  res.json(invoice);
});

router.post('/calculate', authenticateToken, async (req, res) => {
  const { caseId, billingConfig } = req.body;

  const caseItem = await prisma.legalCase.findUnique({
    where: { id: caseId },
    include: { timeEntries: true }
  });

  if (!caseItem) {
    return res.status(404).json({ error: '案件不存在' });
  }

  const config = {
    ...billingConfig,
    progressiveTiers: billingConfig.progressiveTiers || standardProgressiveTiers
  };

  const result = calculateBillingFee(
    config,
    caseItem.timeEntries,
    caseItem.claimAmount?.toNumber()
  );

  res.json(result);
});

router.post('/invoices', authenticateToken, requireRoles([UserRole.FINANCE, UserRole.ADMIN]), async (req: AuthRequest, res) => {
  const { caseId, items, dueDate, notes } = req.body;

  const totalAmount = items.reduce((sum: number, item: any) => sum + item.amount, 0);

  const invoice = await prisma.invoice.create({
    data: {
      caseId,
      invoiceNumber: generateInvoiceNumber(),
      issueDate: new Date(),
      dueDate: dueDate ? new Date(dueDate) : null,
      totalAmount,
      status: PaymentStatus.UNPAID,
      items: {
        create: items.map((item: any) => ({
          description: item.description,
          feeType: item.feeType || FeeType.LEGAL_FEE,
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || item.amount,
          amount: item.amount
        }))
      }
    },
    include: { items: true }
  });

  res.status(201).json(invoice);
});

router.post('/invoices/:id/payments', authenticateToken, requireRoles([UserRole.FINANCE, UserRole.ADMIN]), async (req, res) => {
  const { amount, paymentDate, paymentMethod, payer, notes } = req.body;
  const invoiceId = req.params.id;

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId }
  });

  if (!invoice) {
    return res.status(404).json({ error: '发票不存在' });
  }

  const payment = await prisma.payment.create({
    data: {
      caseId: invoice.caseId,
      invoiceId,
      amount,
      paymentDate: new Date(paymentDate),
      paymentMethod,
      payer,
      notes
    }
  });

  const payments = await prisma.payment.findMany({
    where: { invoiceId }
  });
  const totalPaid = payments.reduce((sum, p) => sum + p.amount.toNumber(), 0);
  const totalAmount = invoice.totalAmount.toNumber();

  let newStatus: PaymentStatus = PaymentStatus.UNPAID;
  if (totalPaid >= totalAmount) {
    newStatus = PaymentStatus.PAID;
  } else if (totalPaid > 0) {
    newStatus = PaymentStatus.PARTIAL;
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: newStatus }
  });

  res.status(201).json(payment);
});

router.put('/invoices/:id/status', authenticateToken, requireRoles([UserRole.FINANCE, UserRole.ADMIN]), async (req, res) => {
  const { status } = req.body;
  const invoice = await prisma.invoice.update({
    where: { id: req.params.id },
    data: { status }
  });
  res.json(invoice);
});

router.get('/reports/overview', authenticateToken, requireRoles([UserRole.FINANCE, UserRole.ADMIN]), async (req, res) => {
  const { startDate, endDate } = req.query;

  const where: any = {};
  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string)
    };
  }

  const invoices = await prisma.invoice.findMany({
    where,
    include: { payments: true }
  });

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount.toNumber(), 0);
  const totalPaid = invoices.reduce((sum, inv) => {
    const paid = inv.payments.reduce((s, p) => s + p.amount.toNumber(), 0);
    return sum + paid;
  }, 0);

  const byStatus = await prisma.invoice.groupBy({
    by: ['status'],
    _sum: { totalAmount: true },
    _count: true
  });

  res.json({
    totalInvoiced,
    totalPaid,
    outstanding: totalInvoiced - totalPaid,
    byStatus
  });
});

export default router;
