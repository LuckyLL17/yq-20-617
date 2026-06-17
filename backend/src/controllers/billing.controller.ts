import { Request, Response, NextFunction } from 'express';
import { BillingService } from '../services/billing.service';
import { success } from '../types/response';
import { PaymentStatus } from '@prisma/client';

const billingService = new BillingService();

export class BillingController {
  async findInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const invoices = await billingService.findInvoices(req.query);
      res.json(success(invoices));
    } catch (error) {
      next(error);
    }
  }

  async findInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await billingService.findInvoiceById(req.params.id);
      res.json(success(invoice));
    } catch (error) {
      next(error);
    }
  }

  async calculateBilling(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await billingService.calculateBilling(req.body);
      res.json(success(result));
    } catch (error) {
      next(error);
    }
  }

  async createInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await billingService.createInvoice(req.body);
      res.status(201).json(success(invoice, '创建发票成功'));
    } catch (error) {
      next(error);
    }
  }

  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await billingService.createPayment(req.params.id, req.body);
      res.status(201).json(success(payment, '创建支付记录成功'));
    } catch (error) {
      next(error);
    }
  }

  async updateInvoiceStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await billingService.updateInvoiceStatus(req.params.id, req.body.status as PaymentStatus);
      res.json(success(invoice, '更新发票状态成功'));
    } catch (error) {
      next(error);
    }
  }

  async getOverviewReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await billingService.getOverviewReport(req.query);
      res.json(success(report));
    } catch (error) {
      next(error);
    }
  }
}
