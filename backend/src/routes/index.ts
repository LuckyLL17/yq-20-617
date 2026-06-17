import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authController } from '../controllers/auth.controller';
import { userController } from '../controllers/user.controller';
import { clientController } from '../controllers/client.controller';
import { caseController } from '../controllers/case.controller';
import { billingController } from '../controllers/billing.controller';
import { performanceController } from '../controllers/performance.controller';
import { authenticateToken, requireRoles } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import {
  LoginDto,
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  CreateClientDto,
  UpdateClientDto,
  CreateCaseDto,
  UpdateCaseDto,
  UpdateCaseStageDto,
  AssignLawyerDto,
  AddEvidenceDto,
  AddHearingDto,
  AddTimeEntryDto,
  ConflictCheckDto,
  AddAdvanceFeeDto,
  CreateInvoiceDto,
  CreatePaymentDto,
  UpdateInvoiceStatusDto,
  CalculateBillingDto,
  InvoiceQueryDto,
  BillingReportQueryDto,
  CalculatePerformanceDto,
  SavePerformanceSharesDto,
  PerformanceQueryDto,
  MonthlyReportDto
} from '../dtos';

const router = Router();

/**
 * 认证路由
 */
const authRouter = Router();
authRouter.post('/login', validateBody(LoginDto), authController.login);
router.use('/auth', authRouter);

/**
 * 用户路由
 */
const userRouter = Router();
userRouter.use(authenticateToken);
userRouter.get('/', requireRoles([UserRole.ADMIN]), validateQuery(UserQueryDto), userController.getAllUsers);
userRouter.get('/lawyers', userController.getLawyers);
userRouter.get('/:id', userController.getUserById);
userRouter.post('/', requireRoles([UserRole.ADMIN]), validateBody(CreateUserDto), userController.createUser);
userRouter.put('/:id', requireRoles([UserRole.ADMIN]), validateBody(UpdateUserDto), userController.updateUser);
userRouter.delete('/:id', requireRoles([UserRole.ADMIN]), userController.deleteUser);
router.use('/users', userRouter);

/**
 * 客户路由
 */
const clientRouter = Router();
clientRouter.use(authenticateToken);
clientRouter.get('/', clientController.getAllClients);
clientRouter.get('/:id', clientController.getClientById);
clientRouter.post('/', validateBody(CreateClientDto), clientController.createClient);
clientRouter.put('/:id', validateBody(UpdateClientDto), clientController.updateClient);
clientRouter.delete('/:id', requireRoles([UserRole.ADMIN]), clientController.deleteClient);
router.use('/clients', clientRouter);

/**
 * 案件路由
 */
const caseRouter = Router();
caseRouter.use(authenticateToken);
caseRouter.get('/', caseController.getCases);
caseRouter.get('/stats', caseController.getCaseStats);
caseRouter.get('/:id', caseController.getCaseById);
caseRouter.post('/', validateBody(CreateCaseDto), caseController.createCase);
caseRouter.put('/:id', validateBody(UpdateCaseDto), caseController.updateCase);
caseRouter.delete('/:id', requireRoles([UserRole.ADMIN]), caseController.deleteCase);
caseRouter.post('/:id/stage', validateBody(UpdateCaseStageDto), caseController.updateCaseStage);
caseRouter.post('/:id/lawyers', validateBody(AssignLawyerDto), caseController.assignLawyer);
caseRouter.delete('/:id/lawyers/:assignmentId', caseController.removeLawyerAssignment);
caseRouter.post('/:id/evidence', validateBody(AddEvidenceDto), caseController.addEvidence);
caseRouter.post('/:id/hearings', validateBody(AddHearingDto), caseController.addHearing);
caseRouter.post('/:id/time-entries', validateBody(AddTimeEntryDto), caseController.addTimeEntry);
caseRouter.post('/:id/conflict-check', validateBody(ConflictCheckDto), caseController.createConflictCheck);
caseRouter.post('/:id/advance-fees', validateBody(AddAdvanceFeeDto), caseController.addAdvanceFee);
router.use('/cases', caseRouter);

/**
 * 账单路由
 */
const billingRouter = Router();
billingRouter.use(authenticateToken);
billingRouter.get('/invoices', validateQuery(InvoiceQueryDto), billingController.getInvoices);
billingRouter.get('/invoices/:id', billingController.getInvoiceById);
billingRouter.post('/calculate', validateBody(CalculateBillingDto), billingController.calculateBilling);
billingRouter.post(
  '/invoices',
  requireRoles([UserRole.FINANCE, UserRole.ADMIN]),
  validateBody(CreateInvoiceDto),
  billingController.createInvoice
);
billingRouter.post(
  '/invoices/:id/payments',
  requireRoles([UserRole.FINANCE, UserRole.ADMIN]),
  validateBody(CreatePaymentDto),
  billingController.createPayment
);
billingRouter.put(
  '/invoices/:id/status',
  requireRoles([UserRole.FINANCE, UserRole.ADMIN]),
  validateBody(UpdateInvoiceStatusDto),
  billingController.updateInvoiceStatus
);
billingRouter.get(
  '/reports/overview',
  requireRoles([UserRole.FINANCE, UserRole.ADMIN]),
  validateQuery(BillingReportQueryDto),
  billingController.getBillingOverviewReport
);
router.use('/billing', billingRouter);

/**
 * 绩效路由
 */
const performanceRouter = Router();
performanceRouter.use(authenticateToken);
performanceRouter.post(
  '/calculate/:caseId',
  requireRoles([UserRole.FINANCE, UserRole.ADMIN]),
  validateBody(CalculatePerformanceDto),
  performanceController.calculatePerformance
);
performanceRouter.post(
  '/save/:caseId',
  requireRoles([UserRole.FINANCE, UserRole.ADMIN]),
  validateBody(SavePerformanceSharesDto),
  performanceController.savePerformanceShares
);
performanceRouter.get('/case/:caseId', performanceController.getCasePerformance);
performanceRouter.get('/lawyer/:lawyerId', validateQuery(PerformanceQueryDto), performanceController.getLawyerPerformance);
performanceRouter.get(
  '/reports/monthly',
  requireRoles([UserRole.FINANCE, UserRole.ADMIN]),
  validateQuery(MonthlyReportDto),
  performanceController.getMonthlyReport
);
performanceRouter.get(
  '/reports/ranking',
  requireRoles([UserRole.FINANCE, UserRole.ADMIN]),
  validateQuery(PerformanceQueryDto),
  performanceController.getLawyerRanking
);
router.use('/performance', performanceRouter);

export default router;
