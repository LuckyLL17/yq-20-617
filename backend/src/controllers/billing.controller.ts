/**
 * 账单控制器
 * 处理账单相关的HTTP请求
 */

import { Request, Response, NextFunction } from 'express';
import { billingService } from '../services/billing.service';
import { success } from '../common/response';

export class BillingController {
  /**
   * 获取发票列表
   */
  async getAllInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const invoices = await billingService.getAllInvoices(req.query as any);
      res.json(success(invoices, '获取发票列表成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取发票详情
   */
  async getInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await billingService.getInvoiceById(req.params.id);
      res.json(success(invoice, '获取发票详情成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 计算律师费
   */
  async calculateBilling(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await billingService.calculateBilling(req.body);
      res.json(success(result, '费用计算成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建发票
   */
  async createInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await billingService.createInvoice(req.body);
      res.status(201).json(success(invoice, '发票创建成功', 201));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建付款记录
   */
  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await billingService.createPayment(req.params.id, req.body);
      res.status(201).json(success(payment, '付款记录创建成功', 201));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新发票状态
   */
  async updateInvoiceStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await billingService.updateInvoiceStatus(req.params.id, req.body);
      res.json(success(invoice, '发票状态更新成功'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取账单概览报告
   */
  async getBillingOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await billingService.getBillingOverview(req.query as any);
      res.json(success(report, '获取账单报告成功'));
    } catch (error) {
      next(error);
    }
  }
}

export const billingController = new BillingController();
