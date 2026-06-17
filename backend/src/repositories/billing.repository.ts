import { prisma } from './prisma';
import { PaymentStatus } from '@prisma/client';

export class BillingRepository {
  async findInvoices(where: any) {
    return prisma.invoice.findMany({
      where,
      include: {
        caseItem: { select: { id: true, caseNumber: true, title: true } },
        items: true,
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findInvoiceById(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        caseItem: true,
        items: true,
        payments: true
      }
    });
  }

  async createInvoice(data: any) {
    return prisma.invoice.create({
      data,
      include: { items: true }
    });
  }

  async updateInvoice(id: string, data: any) {
    return prisma.invoice.update({ where: { id }, data });
  }

  async createPayment(data: any) {
    return prisma.payment.create({ data });
  }

  async findPaymentsByInvoice(invoiceId: string) {
    return prisma.payment.findMany({ where: { invoiceId } });
  }

  async findInvoicesForReport(where: any) {
    return prisma.invoice.findMany({
      where,
      include: { payments: true }
    });
  }

  async groupInvoicesByStatus(where: any) {
    return prisma.invoice.groupBy({
      by: ['status'],
      _sum: { totalAmount: true },
      _count: true
    });
  }
}
