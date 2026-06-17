import { Router } from 'express';
import { CaseController } from '../controllers/case.controller';
import { authenticateToken, requireRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { UserRole } from '@prisma/client';
import {
  createCaseDto,
  updateCaseDto,
  advanceStageDto,
  assignLawyerDto,
  createEvidenceDto,
  createHearingDto,
  createTimeEntryDto,
  createConflictCheckDto,
  createAdvanceFeeDto
} from '../dto/case.dto';

const router = Router();
const caseController = new CaseController();

router.get('/', authenticateToken, caseController.findMany);

router.get('/stats', authenticateToken, caseController.findStats);

router.get('/:id', authenticateToken, caseController.findById);

router.post('/', authenticateToken, validate(createCaseDto), caseController.create);

router.put('/:id', authenticateToken, validate(updateCaseDto), caseController.update);

router.post('/:id/stage', authenticateToken, validate(advanceStageDto), caseController.advanceStage);

router.post('/:id/lawyers', authenticateToken, validate(assignLawyerDto), caseController.assignLawyer);

router.delete('/:id/lawyers/:assignmentId', authenticateToken, caseController.removeLawyerAssignment);

router.post('/:id/evidence', authenticateToken, validate(createEvidenceDto), caseController.addEvidence);

router.post('/:id/hearings', authenticateToken, validate(createHearingDto), caseController.addHearing);

router.post('/:id/time-entries', authenticateToken, validate(createTimeEntryDto), caseController.addTimeEntry);

router.post('/:id/conflict-check', authenticateToken, validate(createConflictCheckDto), caseController.addConflictCheck);

router.post('/:id/advance-fees', authenticateToken, validate(createAdvanceFeeDto), caseController.addAdvanceFee);

router.delete('/:id', authenticateToken, requireRoles([UserRole.ADMIN]), caseController.delete);

export default router;
