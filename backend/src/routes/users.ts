import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken, requireRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { UserRole } from '@prisma/client';
import { createUserDto, updateUserDto } from '../dto/user.dto';

const router = Router();
const userController = new UserController();

router.get('/', authenticateToken, requireRoles([UserRole.ADMIN]), userController.findAll);

router.get('/lawyers', authenticateToken, userController.findLawyers);

router.get('/:id', authenticateToken, userController.findById);

router.post('/', authenticateToken, requireRoles([UserRole.ADMIN]), validate(createUserDto), userController.create);

router.put('/:id', authenticateToken, requireRoles([UserRole.ADMIN]), validate(updateUserDto), userController.update);

router.delete('/:id', authenticateToken, requireRoles([UserRole.ADMIN]), userController.softDelete);

export default router;
