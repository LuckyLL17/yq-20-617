/**
 * 账单数据访问层
 * 封装所有账单相关的数据库操作
 */

import { prisma } from '../common/prisma';
import { Invoice, Payment, PaymentStatus, Prisma, FeeType } from '@prisma/client';

export class BillingRepository {
  /**
   * 生成发票编号
   */
  generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `INV-${year}-${random}`;
  }

  /**
   * 根据ID查找发票
   */
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

  /**
   * 获取发票列表
   */
  async findAllInvoices(where?: Prisma.InvoiceWhereInput) {
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

  /**
   * 创建发票
   */
  async createInvoice(
    caseId: string,
    items: Array<{
      description: string;
      feeType?: FeeType;
      quantity?: number | Prisma.Decimal;
      unitPrice?: number | Prisma.Decimal;
      amount: number | Prisma.Decimal;
    }>,
    dueDate?: Date,
    notes?: string
  ) {
    const totalAmount = items.reduce((sum, item) => {
      const amount = typeof item.amount === 'number' ? item.amount : item.amount.toNumber();
      return sum + amount;
    }, 0);

    return prisma.invoice.create({
      data: {
        caseId,
        invoiceNumber: this.generateInvoiceNumber(),
        issueDate: new Date(),
        dueDate: dueDate || null,
        totalAmount,
        status: PaymentStatus.UNPAID,
        items: {
          create: items.map(item => ({
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
  }

  /**
   * 更新发票状态
   */
  async updateInvoiceStatus(id: string, status: PaymentStatus): Promise<Invoice> {
    return prisma.invoice.update({
      where: { id },
      data: { status }
    });
  }

  /**
   * 创建付款记录
   */
  async createPayment(
    invoiceId: string,
    caseId: string,
    amount: number | Prisma.Decimal,
    paymentDate: Date,
    paymentMethod: string,
    payer?: string,
    notes?: string
  ): Promise<Payment> {
    return prisma.payment.create({
      data: {
        caseId,
        invoiceId,
        amount,
        paymentDate,
        paymentMethod,
        payer: payer || null,
        notes: notes || null
      }
    });
  }

  /**
   * 获取发票的所有付款记录
   */
  async getPaymentsByInvoiceId(invoiceId: string): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { invoiceId }
    });
  }

  /**
   * 获取账单概览报告
   */
  async getBillingOverview(where?: Prisma.InvoiceWhereInput) {
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

    return {
      totalInvoiced,
      totalPaid,
      outstanding: totalInvoiced - totalPaid,
      byStatus
    };
  }
}

export const billingRepository = new BillingRepository();
