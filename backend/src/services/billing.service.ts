import { BillingRepository } from '../repositories/billing.repository';
import { CaseRepository } from '../repositories/case.repository';
import { NotFoundError } from '../types/errors';
import { FeeType, PaymentStatus } from '@prisma/client';
import { calculateBillingFee, standardProgressiveTiers } from '../utils/billingCalculator';
import {
  CreateInvoiceDto,
  CreatePaymentDto,
  CalculateBillingDto
} from '../dto/billing.dto';

const billingRepo = new BillingRepository();
const caseRepo = new CaseRepository();

function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `INV-${year}-${random}`;
}

export class BillingService {
  async findInvoices(query: any) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.caseId) where.caseId = query.caseId;
    return billingRepo.findInvoices(where);
  }

  async findInvoiceById(id: string) {
    const invoice = await billingRepo.findInvoiceById(id);
    if (!invoice) {
      throw new NotFoundError('发票不存在');
    }
    return invoice;
  }

  async calculateBilling(dto: CalculateBillingDto) {
    const caseItem = await caseRepo.findByIdWithTimeEntries(dto.caseId);
    if (!caseItem) {
      throw new NotFoundError('案件不存在');
    }

    const config = {
      ...dto.billingConfig,
      progressiveTiers: dto.billingConfig.progressiveTiers || standardProgressiveTiers
    };

    return calculateBillingFee(
      config,
      caseItem.timeEntries,
      caseItem.claimAmount?.toNumber()
    );
  }

  async createInvoice(dto: CreateInvoiceDto) {
    const totalAmount = dto.items.reduce((sum, item) => sum + item.amount, 0);

    return billingRepo.createInvoice({
      caseId: dto.caseId,
      invoiceNumber: generateInvoiceNumber(),
      issueDate: new Date(),
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      totalAmount,
      status: PaymentStatus.UNPAID,
      items: {
        create: dto.items.map(item => ({
          description: item.description,
          feeType: item.feeType || FeeType.LEGAL_FEE,
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || item.amount,
          amount: item.amount
        }))
      }
    });
  }

  async createPayment(invoiceId: string, dto: CreatePaymentDto) {
    const invoice = await billingRepo.findInvoiceById(invoiceId);
    if (!invoice) {
      throw new NotFoundError('发票不存在');
    }

    const payment = await billingRepo.createPayment({
      caseId: invoice.caseId,
      invoiceId,
      amount: dto.amount,
      paymentDate: new Date(dto.paymentDate),
      paymentMethod: dto.paymentMethod,
      payer: dto.payer,
      notes: dto.notes
    });

    const payments = await billingRepo.findPaymentsByInvoice(invoiceId);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount.toNumber(), 0);
    const totalAmount = invoice.totalAmount.toNumber();

    let newStatus: PaymentStatus = PaymentStatus.UNPAID;
    if (totalPaid >= totalAmount) {
      newStatus = PaymentStatus.PAID;
    } else if (totalPaid > 0) {
      newStatus = PaymentStatus.PARTIAL;
    }

    await billingRepo.updateInvoice(invoiceId, { status: newStatus });

    return payment;
  }

  async updateInvoiceStatus(id: string, status: PaymentStatus) {
    return billingRepo.updateInvoice(id, { status });
  }

  async getOverviewReport(query: any) {
    const where: any = {};
    if (query.startDate && query.endDate) {
      where.createdAt = {
        gte: new Date(query.startDate as string),
        lte: new Date(query.endDate as string)
      };
    }

    const invoices = await billingRepo.findInvoicesForReport(where);

    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount.toNumber(), 0);
    const totalPaid = invoices.reduce((sum, inv) => {
      const paid = inv.payments.reduce((s, p) => s + p.amount.toNumber(), 0);
      return sum + paid;
    }, 0);

    const byStatus = await billingRepo.groupInvoicesByStatus(where);

    return {
      totalInvoiced,
      totalPaid,
      outstanding: totalInvoiced - totalPaid,
      byStatus
    };
  }
}
