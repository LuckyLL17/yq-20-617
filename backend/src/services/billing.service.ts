import { billingRepository } from '../repositories/billing.repository';
import { caseRepository } from '../repositories/case.repository';
import {
  CreateInvoiceDto,
  CreatePaymentDto,
  InvoiceQueryDto,
  UpdateInvoiceStatusDto,
  CalculateBillingDto,
  BillingOverviewQueryDto
} from '../dtos/billing.dto';
import { NotFoundError } from '../errors/ApiError';
import { calculateBillingFee, standardProgressiveTiers } from '../utils/billingCalculator';
import { PaymentStatus } from '@prisma/client';

/**
 * 账单服务
 * 处理账单相关的业务逻辑
 */
export class BillingService {
  /**
   * 获取发票列表
   * @param query 查询参数
   */
  async getInvoices(query: InvoiceQueryDto = {}) {
    return billingRepository.findInvoices(query);
  }

  /**
   * 根据ID获取发票
   * @param id 发票ID
   */
  async getInvoiceById(id: string) {
    const invoice = await billingRepository.findInvoiceById(id);
    if (!invoice) {
      throw new NotFoundError('发票不存在');
    }
    return invoice;
  }

  /**
   * 计算计费
   * @param dto 计费计算数据
   */
  async calculateBilling(dto: CalculateBillingDto) {
    const caseItem = await caseRepository.findById(dto.caseId);
    if (!caseItem) {
      throw new NotFoundError('案件不存在');
    }

    const caseWithTimeEntries = await (caseRepository as any).findByIdWithDetails(dto.caseId);
    const timeEntries = caseWithTimeEntries?.timeEntries || [];

    const config = {
      ...dto.billingConfig,
      progressiveTiers: dto.billingConfig.progressiveTiers || standardProgressiveTiers
    };

    return calculateBillingFee(
      config,
      timeEntries,
      caseItem.claimAmount?.toNumber()
    );
  }

  /**
   * 创建发票
   * @param dto 发票数据
   */
  async createInvoice(dto: CreateInvoiceDto) {
    const caseExists = await caseRepository.exists(dto.caseId);
    if (!caseExists) {
      throw new NotFoundError('案件不存在');
    }

    return billingRepository.createInvoice(dto);
  }

  /**
   * 创建支付记录
   * @param invoiceId 发票ID
   * @param dto 支付数据
   */
  async createPayment(invoiceId: string, dto: CreatePaymentDto) {
    const invoice = await billingRepository.findInvoiceById(invoiceId);
    if (!invoice) {
      throw new NotFoundError('发票不存在');
    }

    const payment = await billingRepository.createPayment(
      invoiceId,
      invoice.caseId,
      dto
    );

    await this.updateInvoicePaymentStatus(invoiceId);

    return payment;
  }

  /**
   * 更新发票支付状态
   * @param invoiceId 发票ID
   */
  private async updateInvoicePaymentStatus(invoiceId: string): Promise<void> {
    const invoice = await billingRepository.findInvoiceById(invoiceId);
    if (!invoice) return;

    const payments = await billingRepository.findPaymentsByInvoiceId(invoiceId);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount.toNumber(), 0);
    const totalAmount = invoice.totalAmount.toNumber();

    let newStatus: PaymentStatus = PaymentStatus.UNPAID;
    if (totalPaid >= totalAmount) {
      newStatus = PaymentStatus.PAID;
    } else if (totalPaid > 0) {
      newStatus = PaymentStatus.PARTIAL;
    }

    await billingRepository.updateInvoiceStatus(invoiceId, { status: newStatus });
  }

  /**
   * 更新发票状态
   * @param id 发票ID
   * @param dto 状态数据
   */
  async updateInvoiceStatus(id: string, dto: UpdateInvoiceStatusDto) {
    const exists = await billingRepository.invoiceExists(id);
    if (!exists) {
      throw new NotFoundError('发票不存在');
    }
    return billingRepository.updateInvoiceStatus(id, dto);
  }

  /**
   * 获取财务概览报告
   * @param query 查询参数
   */
  async getBillingOverview(query: BillingOverviewQueryDto = {}) {
    return billingRepository.getBillingOverview(query);
  }
}

export const billingService = new BillingService();
