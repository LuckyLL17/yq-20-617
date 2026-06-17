import { PaymentStatus, FeeType } from '@prisma/client';
import {
  CreateInvoiceDtoType,
  CreatePaymentDtoType,
  UpdateInvoiceStatusDtoType,
  CalculateBillingDtoType,
  InvoiceQueryDtoType,
  BillingReportQueryDtoType
} from '../dtos/billing.dto';
import { invoiceRepository } from '../repositories/InvoiceRepository';
import { paymentRepository } from '../repositories/PaymentRepository';
import { caseRepository } from '../repositories/CaseRepository';
import { calculateBillingFee, standardProgressiveTiers } from '../utils/billingCalculator';
import { NotFoundError, BadRequestError } from '../common/errors';

/**
 * 账单服务
 * 处理发票、付款、计费计算等业务逻辑
 */
class BillingService {
  /**
   * 获取发票列表
   */
  async getInvoices(filters: { status?: string; caseId?: string }): Promise<any[]> {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.caseId) where.caseId = filters.caseId;

    return invoiceRepository.findAllWithRelations(where);
  }

  /**
   * 根据 ID 获取发票详情
   */
  async getInvoiceById(id: string): Promise<any> {
    const invoice = await invoiceRepository.findByIdWithDetails(id);
    if (!invoice) {
      throw new NotFoundError('发票不存在', 'INVOICE_NOT_FOUND');
    }
    return invoice;
  }

  /**
   * 计算计费
   */
  async calculateBilling(calculateBillingDto: CalculateBillingDtoType): Promise<any> {
    const { caseId, billingConfig } = calculateBillingDto;

    // 获取案件及其时间条目
    const caseItem = await caseRepository.findByIdWithTimeEntries(caseId);
    if (!caseItem) {
      throw new NotFoundError('案件不存在', 'CASE_NOT_FOUND');
    }

    // 构建计费配置
    const config = {
      ...billingConfig,
      progressiveTiers: (billingConfig as any).progressiveTiers || standardProgressiveTiers
    };

    // 计算费用
    const result = calculateBillingFee(
      config as any,
      caseItem.timeEntries,
      caseItem.claimAmount?.toNumber()
    );

    return result;
  }

  /**
   * 创建发票
   */
  async createInvoice(createInvoiceDto: CreateInvoiceDtoType): Promise<any> {
    const { caseId, items, dueDate } = createInvoiceDto;

    // 验证案件是否存在
    const caseItem = await caseRepository.findById(caseId);
    if (!caseItem) {
      throw new NotFoundError('案件不存在', 'CASE_NOT_FOUND');
    }

    // 计算总金额
    const totalAmount = items.reduce((sum: number, item: any) => sum + item.amount, 0);

    // 生成发票编号
    const invoiceNumber = invoiceRepository.generateInvoiceNumber();

    // 创建发票（包含明细）
    const invoiceData: any = {
      caseId,
      invoiceNumber,
      issueDate: new Date(),
      dueDate: dueDate || null,
      totalAmount,
      status: PaymentStatus.UNPAID,
      items: items.map((item: any) => ({
        description: item.description,
        feeType: item.feeType || FeeType.LEGAL_FEE,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || item.amount,
        amount: item.amount
      }))
    };

    return invoiceRepository.createWithItems(invoiceData);
  }

  /**
   * 创建付款记录
   */
  async createPayment(invoiceId: string, createPaymentDto: CreatePaymentDtoType): Promise<any> {
    // 验证发票是否存在
    const invoice = await invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new NotFoundError('发票不存在', 'INVOICE_NOT_FOUND');
    }

    // 创建付款记录
    const payment = await paymentRepository.create({
      caseId: invoice.caseId,
      invoiceId,
      amount: createPaymentDto.amount,
      paymentDate: createPaymentDto.paymentDate,
      paymentMethod: createPaymentDto.paymentMethod,
      payer: createPaymentDto.payer,
      notes: createPaymentDto.notes
    } as any);

    // 更新发票状态
    await this.updateInvoicePaymentStatus(invoiceId);

    return payment;
  }

  /**
   * 更新发票状态
   */
  async updateInvoiceStatus(id: string, updateStatusDto: UpdateInvoiceStatusDtoType): Promise<any> {
    // 验证发票是否存在
    const invoice = await invoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundError('发票不存在', 'INVOICE_NOT_FOUND');
    }

    return invoiceRepository.updateStatus(id, updateStatusDto.status);
  }

  /**
   * 根据付款情况更新发票状态
   */
  private async updateInvoicePaymentStatus(invoiceId: string): Promise<void> {
    const invoice = await invoiceRepository.findById(invoiceId);
    if (!invoice) return;

    const totalPaid = await paymentRepository.calculateTotalPaid(invoiceId);
    const totalAmount = invoice.totalAmount.toNumber();

    let newStatus: PaymentStatus = PaymentStatus.UNPAID;
    if (totalPaid >= totalAmount) {
      newStatus = PaymentStatus.PAID;
    } else if (totalPaid > 0) {
      newStatus = PaymentStatus.PARTIAL;
    }

    await invoiceRepository.updateStatus(invoiceId, newStatus);
  }

  /**
   * 获取财务概览报表
   */
  async getBillingOverviewReport(filters: BillingReportQueryDtoType): Promise<any> {
    const where: any = {};
    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        gte: filters.startDate,
        lte: filters.endDate
      };
    }

    // 获取所有发票及其付款
    const invoices = await invoiceRepository.findAllWithRelations(where);

    // 计算总开票金额和总收款金额
    const totalInvoiced = invoices.reduce((sum: number, inv: any) => sum + inv.totalAmount.toNumber(), 0);
    const totalPaid = invoices.reduce((sum: number, inv: any) => {
      const paid = inv.payments.reduce((s: number, p: any) => s + p.amount.toNumber(), 0);
      return sum + paid;
    }, 0);

    // 按状态统计
    const byStatus = await invoiceRepository.groupByStatus(where);

    return {
      totalInvoiced,
      totalPaid,
      outstanding: totalInvoiced - totalPaid,
      byStatus
    };
  }
}

export const billingService = new BillingService();
