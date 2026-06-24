import { Router } from 'express';
import { billingController } from '../controllers/billing.controller';
import { authenticateToken, requireRoles } from '../middleware/auth';
import { asyncHandler, validateBody } from '../middleware/validate';
import {
  createInvoiceDto,
  createPaymentDto,
  updateInvoiceStatusDto,
  calculateBillingDto
} from '../dtos/billing.dto';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * 账单路由
 * 处理账单相关请求
 */

// 获取发票列表
router.get(
  '/invoices',
  authenticateToken,
  asyncHandler(billingController.getInvoices.bind(billingController))
);

// 获取发票详情
router.get(
  '/invoices/:id',
  authenticateToken,
  asyncHandler(billingController.getInvoiceById.bind(billingController))
);

// 计算计费
router.post(
  '/calculate',
  authenticateToken,
  validateBody(calculateBillingDto),
  asyncHandler(billingController.calculateBilling.bind(billingController))
);

// 创建发票（仅财务和管理员）
router.post(
  '/invoices',
  authenticateToken,
  requireRoles([UserRole.FINANCE, UserRole.ADMIN]),
  validateBody(createInvoiceDto),
  asyncHandler(billingController.createInvoice.bind(billingController))
);

// 创建支付记录（仅财务和管理员）
router.post(
  '/invoices/:id/payments',
  authenticateToken,
  requireRoles([UserRole.FINANCE, UserRole.ADMIN]),
  validateBody(createPaymentDto),
  asyncHandler(billingController.createPayment.bind(billingController))
);

// 更新发票状态（仅财务和管理员）
router.put(
  '/invoices/:id/status',
  authenticateToken,
  requireRoles([UserRole.FINANCE, UserRole.ADMIN]),
  validateBody(updateInvoiceStatusDto),
  asyncHandler(billingController.updateInvoiceStatus.bind(billingController))
);

// 获取财务概览报告（仅财务和管理员）
router.get(
  '/reports/overview',
  authenticateToken,
  requireRoles([UserRole.FINANCE, UserRole.ADMIN]),
  asyncHandler(billingController.getBillingOverview.bind(billingController))
);

export default router;
