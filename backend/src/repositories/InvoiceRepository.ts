import { Invoice, Prisma, PaymentStatus } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

/**
 * 发票数据访问层
 */
class InvoiceRepository extends BaseRepository<Invoice, Prisma.InvoiceCreateInput, Prisma.InvoiceUpdateInput> {
  constructor() {
    super('Invoice');
  }

  protected get model() {
    return this.prisma.invoice;
  }

  /**
   * 生成发票编号
   */
  generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `INV-${year}-${random}`;
  }

  /**
   * 获取发票列表（包含关联信息）
   */
  async findAllWithRelations(
    where?: Prisma.InvoiceWhereInput
  ): Promise<Invoice[]> {
    return this.model.findMany({
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
   * 获取发票详情
   */
  async findByIdWithDetails(id: string): Promise<Invoice | null> {
    return this.model.findUnique({
      where: { id },
      include: {
        caseItem: true,
        items: true,
        payments: true
      }
    });
  }

  /**
   * 创建发票（包含明细）
   */
  async createWithItems(
    data: Prisma.InvoiceCreateInput & { items: Prisma.InvoiceItemCreateManyInvoiceInput[] }
  ): Promise<Invoice> {
    const { items, ...invoiceData } = data;
    return this.model.create({
      data: {
        ...invoiceData,
        items: {
          create: items
        }
      },
      include: { items: true }
    });
  }

  /**
   * 更新发票状态
   */
  async updateStatus(id: string, status: PaymentStatus): Promise<Invoice> {
    return this.model.update({
      where: { id },
      data: { status }
    });
  }

  /**
   * 按状态统计发票
   */
  async groupByStatus(where?: Prisma.InvoiceWhereInput): Promise<any[]> {
    return this.model.groupBy({
      by: ['status'],
      where,
      _sum: { totalAmount: true },
      _count: true
    });
  }
}

export const invoiceRepository = new InvoiceRepository();
