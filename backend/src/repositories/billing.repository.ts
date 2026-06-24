import { prisma } from '../config/prisma';
import { Invoice, Payment, PaymentStatus, FeeType } from '@prisma/client';
import { CreateInvoiceDto, CreatePaymentDto, InvoiceQueryDto, UpdateInvoiceStatusDto, BillingOverviewQueryDto } from '../dtos/billing.dto';
import { Prisma } from '@prisma/client';

/**
 * 账单数据访问层
 * 封装所有账单相关的数据库操作
 */
export class BillingRepository {
  /**
   * 发票列表关联字段
   */
  private invoiceListInclude = {
    caseItem: { select: { id: true, caseNumber: true, title: true } },
    items: true,
    payments: true
  };

  /**
   * 发票详情关联字段
   */
  private invoiceDetailInclude = {
    caseItem: true,
    items: true,
    payments: true
  };

  /**
   * 生成发票号
   */
  private generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `INV-${year}-${random}`;
  }

  /**
   * 查询发票列表
   * @param query 查询参数
   */
  async findInvoices(query: InvoiceQueryDto = {}): Promise<any[]> {
    const where: Prisma.InvoiceWhereInput = {};
    
    if (query.status) {
      where.status = query.status;
    }
    if (query.caseId) {
      where.caseId = query.caseId;
    }

    return prisma.invoice.findMany({
      where,
      include: this.invoiceListInclude,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * 根据ID查找发票
   * @param id 发票ID
   */
  async findInvoiceById(id: string): Promise<any> {
    return prisma.invoice.findUnique({
      where: { id },
      include: this.invoiceDetailInclude
    });
  }

  /**
   * 创建发票
   * @param data 发票数据
   */
  async createInvoice(data: CreateInvoiceDto): Promise<any> {
    const totalAmount = data.items.reduce((sum, item) => sum + item.amount, 0);

    return prisma.invoice.create({
      data: {
        caseId: data.caseId,
        invoiceNumber: this.generateInvoiceNumber(),
        issueDate: new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        totalAmount,
        status: PaymentStatus.UNPAID,
        items: {
          create: data.items.map(item => ({
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
   * @param id 发票ID
   * @param data 状态数据
   */
  async updateInvoiceStatus(id: string, data: UpdateInvoiceStatusDto): Promise<Invoice> {
    return prisma.invoice.update({
      where: { id },
      data: { status: data.status }
    });
  }

  /**
   * 创建支付记录
   * @param invoiceId 发票ID
   * @param caseId 案件ID
   * @param data 支付数据
   */
  async createPayment(invoiceId: string, caseId: string, data: CreatePaymentDto): Promise<Payment> {
    return prisma.payment.create({
      data: {
        caseId,
        invoiceId,
        amount: data.amount,
        paymentDate: new Date(data.paymentDate),
        paymentMethod: data.paymentMethod,
        payer: data.payer || null,
        notes: data.notes || null
      }
    });
  }

  /**
   * 获取发票的所有支付记录
   * @param invoiceId 发票ID
   */
  async findPaymentsByInvoiceId(invoiceId: string): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { invoiceId }
    });
  }

  /**
   * 获取财务概览报告
   * @param query 查询参数
   */
  async getBillingOverview(query: BillingOverviewQueryDto = {}): Promise<any> {
    const where: Prisma.InvoiceWhereInput = {};
    
    if (query.startDate && query.endDate) {
      where.createdAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate)
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

    return {
      totalInvoiced,
      totalPaid,
      outstanding: totalInvoiced - totalPaid,
      byStatus
    };
  }

  /**
   * 检查发票是否存在
   * @param id 发票ID
   */
  async invoiceExists(id: string): Promise<boolean> {
    const count = await prisma.invoice.count({
      where: { id }
    });
    return count > 0;
  }

  /**
   * 检查案号是否存在
   * @param caseNumber 案号
   */
  async invoiceNumberExists(caseNumber: string): Promise<boolean> {
    const count = await prisma.invoice.count({
      where: { invoiceNumber: caseNumber }
    });
    return count > 0;
  }
}

export const billingRepository = new BillingRepository();
