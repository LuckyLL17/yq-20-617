import { Router } from 'express';
import { PerformanceController } from '../controllers/performance.controller';
import { authenticateToken, requireRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { UserRole } from '@prisma/client';
import {
  calculatePerformanceDto,
  savePerformanceSharesDto
} from '../dto/performance.dto';

const router = Router();
const performanceController = new PerformanceController();

router.post('/calculate/:caseId', authenticateToken, requireRoles([UserRole.FINANCE, UserRole.ADMIN]), validate(calculatePerformanceDto), performanceController.calculateShares);

router.post('/save/:caseId', authenticateToken, requireRoles([UserRole.FINANCE, UserRole.ADMIN]), validate(savePerformanceSharesDto), performanceController.saveShares);

router.get('/case/:caseId', authenticateToken, performanceController.findSharesByCase);

router.get('/lawyer/:lawyerId', authenticateToken, performanceController.findSharesByLawyer);

router.get('/reports/monthly', authenticateToken, requireRoles([UserRole.FINANCE, UserRole.ADMIN]), performanceController.getMonthlyReport);

router.get('/reports/ranking', authenticateToken, requireRoles([UserRole.FINANCE, UserRole.ADMIN]), performanceController.getRanking);

export default router;
