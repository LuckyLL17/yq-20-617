import { Router } from 'express';
import { ClientController } from '../controllers/client.controller';
import { authenticateToken, requireRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { UserRole } from '@prisma/client';
import { createClientDto, updateClientDto } from '../dto/client.dto';

const router = Router();
const clientController = new ClientController();

router.get('/', authenticateToken, clientController.findAll);

router.get('/:id', authenticateToken, clientController.findById);

router.post('/', authenticateToken, validate(createClientDto), clientController.create);

router.put('/:id', authenticateToken, validate(updateClientDto), clientController.update);

router.delete('/:id', authenticateToken, requireRoles([UserRole.ADMIN]), clientController.delete);

export default router;
