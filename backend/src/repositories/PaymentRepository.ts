import { Payment, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

/**
 * 付款数据访问层
 */
class PaymentRepository extends BaseRepository<Payment, Prisma.PaymentCreateInput, Prisma.PaymentUpdateInput> {
  constructor() {
    super('Payment');
  }

  protected get model() {
    return this.prisma.payment;
  }

  /**
   * 获取发票的所有付款记录
   */
  async findByInvoiceId(invoiceId: string): Promise<Payment[]> {
    return this.model.findMany({
      where: { invoiceId },
      orderBy: { paymentDate: 'desc' }
    });
  }

  /**
   * 获取案件的所有付款记录
   */
  async findByCaseId(caseId: string): Promise<Payment[]> {
    return this.model.findMany({
      where: { caseId },
      orderBy: { paymentDate: 'desc' }
    });
  }

  /**
   * 计算发票已付款总额
   */
  async calculateTotalPaid(invoiceId: string): Promise<number> {
    const payments = await this.model.findMany({
      where: { invoiceId }
    });
    return payments.reduce((sum, p) => sum + p.amount.toNumber(), 0);
  }
}

export const paymentRepository = new PaymentRepository();
