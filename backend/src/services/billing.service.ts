/**
 * 账单服务
 * 处理账单相关的业务逻辑
 */

import { billingRepository } from '../repositories/billing.repository';
import { caseRepository } from '../repositories/case.repository';
import { NotFoundError } from '../common/errors';
import {
  InvoiceQueryDto,
  CalculateBillingDto,
  CreateInvoiceDto,
  CreatePaymentDto,
  UpdateInvoiceStatusDto,
  BillingReportQueryDto
} from '../dto/billing.dto';
import { calculateBillingFee, standardProgressiveTiers } from '../utils/billingCalculator';
import { Prisma, PaymentStatus } from '@prisma/client';

export class BillingService {
  /**
   * 获取发票列表
   */
  async getAllInvoices(query: InvoiceQueryDto) {
    const where: Prisma.InvoiceWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.caseId) where.caseId = query.caseId;

    return billingRepository.findAllInvoices(where);
  }

  /**
   * 根据ID获取发票
   */
  async getInvoiceById(id: string) {
    const invoice = await billingRepository.findInvoiceById(id);
    if (!invoice) {
      throw new NotFoundError('发票不存在');
    }
    return invoice;
  }

  /**
   * 计算律师费
   */
  async calculateBilling(calculateBillingDto: CalculateBillingDto) {
    const { caseId, billingConfig } = calculateBillingDto;

    const caseItem = await caseRepository.findById(caseId);
    if (!caseItem) {
      throw new NotFoundError('案件不存在');
    }

    const timeEntries = await caseRepository.getTimeEntries(caseId);

    const config = {
      ...billingConfig,
      progressiveTiers: billingConfig.progressiveTiers || standardProgressiveTiers
    };

    return calculateBillingFee(
      config as any,
      timeEntries as any,
      caseItem.claimAmount?.toNumber()
    );
  }

  /**
   * 创建发票
   */
  async createInvoice(createInvoiceDto: CreateInvoiceDto) {
    const { caseId, items, dueDate } = createInvoiceDto;

    // 验证案件是否存在
    const caseItem = await caseRepository.findById(caseId);
    if (!caseItem) {
      throw new NotFoundError('案件不存在');
    }

    return billingRepository.createInvoice(
      caseId,
      items,
      dueDate ? new Date(dueDate) : undefined
    );
  }

  /**
   * 创建付款记录
   */
  async createPayment(invoiceId: string, createPaymentDto: CreatePaymentDto) {
    const invoice = await billingRepository.findInvoiceById(invoiceId);
    if (!invoice) {
      throw new NotFoundError('发票不存在');
    }

    const payment = await billingRepository.createPayment(
      invoiceId,
      invoice.caseId,
      createPaymentDto.amount,
      new Date(createPaymentDto.paymentDate),
      createPaymentDto.paymentMethod,
      createPaymentDto.payer,
      createPaymentDto.notes
    );

    // 更新发票状态
    await this.updateInvoicePaymentStatus(invoiceId);

    return payment;
  }

  /**
   * 根据付款情况更新发票状态
   */
  private async updateInvoicePaymentStatus(invoiceId: string) {
    const invoice = await billingRepository.findInvoiceById(invoiceId);
    if (!invoice) return;

    const payments = await billingRepository.getPaymentsByInvoiceId(invoiceId);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount.toNumber(), 0);
    const totalAmount = invoice.totalAmount.toNumber();

    let newStatus: PaymentStatus = PaymentStatus.UNPAID;
    if (totalPaid >= totalAmount) {
      newStatus = PaymentStatus.PAID;
    } else if (totalPaid > 0) {
      newStatus = PaymentStatus.PARTIAL;
    }

    if (newStatus !== invoice.status) {
      await billingRepository.updateInvoiceStatus(invoiceId, newStatus);
    }
  }

  /**
   * 更新发票状态
   */
  async updateInvoiceStatus(id: string, updateInvoiceStatusDto: UpdateInvoiceStatusDto) {
    const invoice = await billingRepository.findInvoiceById(id);
    if (!invoice) {
      throw new NotFoundError('发票不存在');
    }

    return billingRepository.updateInvoiceStatus(id, updateInvoiceStatusDto.status);
  }

  /**
   * 获取账单概览报告
   */
  async getBillingOverview(query: BillingReportQueryDto) {
    const where: Prisma.InvoiceWhereInput = {};
    if (query.startDate && query.endDate) {
      where.createdAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate)
      };
    }

    return billingRepository.getBillingOverview(where);
  }
}

export const billingService = new BillingService();
