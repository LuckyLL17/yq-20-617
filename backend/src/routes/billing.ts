/**
 * 账单路由
 * 处理账单相关请求
 */

import { Router } from 'express';
import { billingController } from '../controllers/billing.controller';
import { authenticateToken, requireRoles } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  invoiceQueryDto,
  calculateBillingDto,
  createInvoiceDto,
  createPaymentDto,
  updateInvoiceStatusDto,
  billingReportQueryDto
} from '../dto/billing.dto';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * @route GET /api/billing/invoices
 * @desc 获取发票列表
 * @access Private
 */
router.get(
  '/invoices',
  authenticateToken,
  validateQuery(invoiceQueryDto),
  billingController.getAllInvoices
);

/**
 * @route GET /api/billing/invoices/:id
 * @desc 获取发票详情
 * @access Private
 */
router.get('/invoices/:id', authenticateToken, billingController.getInvoiceById);

/**
 * @route POST /api/billing/calculate
 * @desc 计算律师费
 * @access Private
 */
router.post(
  '/calculate',
  authenticateToken,
  validateBody(calculateBillingDto),
  billingController.calculateBilling
);

/**
 * @route POST /api/billing/invoices
 * @desc 创建发票
 * @access Private (Finance, Admin)
 */
router.post(
  '/invoices',
  authenticateToken,
  requireRoles([UserRole.FINANCE, UserRole.ADMIN]),
  validateBody(createInvoiceDto),
  billingController.createInvoice
);

/**
 * @route POST /api/billing/invoices/:id/payments
 * @desc 创建付款记录
 * @access Private (Finance, Admin)
 */
router.post(
  '/invoices/:id/payments',
  authenticateToken,
  requireRoles([UserRole.FINANCE, UserRole.ADMIN]),
  validateBody(createPaymentDto),
  billingController.createPayment
);

/**
 * @route PUT /api/billing/invoices/:id/status
 * @desc 更新发票状态
 * @access Private (Finance, Admin)
 */
router.put(
  '/invoices/:id/status',
  authenticateToken,
  requireRoles([UserRole.FINANCE, UserRole.ADMIN]),
  validateBody(updateInvoiceStatusDto),
  billingController.updateInvoiceStatus
);

/**
 * @route GET /api/billing/reports/overview
 * @desc 获取账单概览报告
 * @access Private (Finance, Admin)
 */
router.get(
  '/reports/overview',
  authenticateToken,
  requireRoles([UserRole.FINANCE, UserRole.ADMIN]),
  validateQuery(billingReportQueryDto),
  billingController.getBillingOverview
);

export default router;
