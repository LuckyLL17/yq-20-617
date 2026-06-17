import { Router } from 'express';
import { BillingController } from '../controllers/billing.controller';
import { authenticateToken, requireRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { UserRole } from '@prisma/client';
import {
  createInvoiceDto,
  createPaymentDto,
  updateInvoiceStatusDto,
  calculateBillingDto
} from '../dto/billing.dto';

const router = Router();
const billingController = new BillingController();

router.get('/invoices', authenticateToken, billingController.findInvoices);

router.get('/invoices/:id', authenticateToken, billingController.findInvoiceById);

router.post('/calculate', authenticateToken, validate(calculateBillingDto), billingController.calculateBilling);

router.post('/invoices', authenticateToken, requireRoles([UserRole.FINANCE, UserRole.ADMIN]), validate(createInvoiceDto), billingController.createInvoice);

router.post('/invoices/:id/payments', authenticateToken, requireRoles([UserRole.FINANCE, UserRole.ADMIN]), validate(createPaymentDto), billingController.createPayment);

router.put('/invoices/:id/status', authenticateToken, requireRoles([UserRole.FINANCE, UserRole.ADMIN]), validate(updateInvoiceStatusDto), billingController.updateInvoiceStatus);

router.get('/reports/overview', authenticateToken, requireRoles([UserRole.FINANCE, UserRole.ADMIN]), billingController.getOverviewReport);

export default router;
