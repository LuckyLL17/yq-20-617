import { Response } from 'express';
import { billingService } from '../services/billing.service';
import { success, created } from '../utils/response';
import { AuthRequest } from '../types/common';
import {
  CreateInvoiceDto,
  CreatePaymentDto,
  InvoiceQueryDto,
  UpdateInvoiceStatusDto,
  CalculateBillingDto,
  BillingOverviewQueryDto
} from '../dtos/billing.dto';

/**
 * 账单控制器
 * 处理账单相关的 HTTP 请求
 */
export class BillingController {
  /**
   * 获取发票列表
   */
  async getInvoices(req: AuthRequest, res: Response): Promise<void> {
    const query = req.query as unknown as InvoiceQueryDto;
    const invoices = await billingService.getInvoices(query);
    success(res, invoices, '获取发票列表成功');
  }

  /**
   * 获取发票详情
   */
  async getInvoiceById(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const invoice = await billingService.getInvoiceById(id);
    success(res, invoice, '获取发票详情成功');
  }

  /**
   * 计算计费
   */
  async calculateBilling(req: AuthRequest, res: Response): Promise<void> {
    const dto = req.body as CalculateBillingDto;
    const result = await billingService.calculateBilling(dto);
    success(res, result, '计费计算成功');
  }

  /**
   * 创建发票
   */
  async createInvoice(req: AuthRequest, res: Response): Promise<void> {
    const dto = req.body as CreateInvoiceDto;
    const invoice = await billingService.createInvoice(dto);
    created(res, invoice, '发票创建成功');
  }

  /**
   * 创建支付记录
   */
  async createPayment(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as CreatePaymentDto;
    const payment = await billingService.createPayment(id, dto);
    created(res, payment, '支付记录创建成功');
  }

  /**
   * 更新发票状态
   */
  async updateInvoiceStatus(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateInvoiceStatusDto;
    const invoice = await billingService.updateInvoiceStatus(id, dto);
    success(res, invoice, '发票状态更新成功');
  }

  /**
   * 获取财务概览报告
   */
  async getBillingOverview(req: AuthRequest, res: Response): Promise<void> {
    const query = req.query as unknown as BillingOverviewQueryDto;
    const overview = await billingService.getBillingOverview(query);
    success(res, overview, '获取财务概览成功');
  }
}

export const billingController = new BillingController();
