import { Request, Response, NextFunction } from 'express';
import { billingService } from '../services/billing.service';
import { success, created } from '../common/response';
import {
  CreateInvoiceDtoType,
  CreatePaymentDtoType,
  UpdateInvoiceStatusDtoType,
  CalculateBillingDtoType,
  BillingReportQueryDtoType
} from '../dtos/billing.dto';

/**
 * 账单控制器
 * 处理账单、发票、付款相关的 HTTP 请求
 */
class BillingController {
  /**
   * 获取发票列表
   */
  async getInvoices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, caseId } = req.query;
      const invoices = await billingService.getInvoices({
        status: status as string,
        caseId: caseId as string
      });
      res.json(success(invoices, '获取发票列表成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 根据 ID 获取发票详情
   */
  async getInvoiceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await billingService.getInvoiceById(req.params.id);
      res.json(success(invoice, '获取发票详情成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 计算计费
   */
  async calculateBilling(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const calculateBillingDto: CalculateBillingDtoType = req.validatedBody || req.body;
      const result = await billingService.calculateBilling(calculateBillingDto);
      res.json(success(result, '计费计算成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建发票
   */
  async createInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createInvoiceDto: CreateInvoiceDtoType = req.validatedBody || req.body;
      const invoice = await billingService.createInvoice(createInvoiceDto);
      res.status(201).json(created(invoice, '创建发票成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建付款记录
   */
  async createPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createPaymentDto: CreatePaymentDtoType = req.validatedBody || req.body;
      const payment = await billingService.createPayment(req.params.id, createPaymentDto);
      res.status(201).json(created(payment, '创建付款记录成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新发票状态
   */
  async updateInvoiceStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updateStatusDto: UpdateInvoiceStatusDtoType = req.validatedBody || req.body;
      const invoice = await billingService.updateInvoiceStatus(req.params.id, updateStatusDto);
      res.json(success(invoice, '更新发票状态成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取财务概览报表
   */
  async getBillingOverviewReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const report = await billingService.getBillingOverviewReport({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      });
      res.json(success(report, '获取财务报表成功'));
    } catch (error) {
      next(error);
    }
  }
}

export const billingController = new BillingController();
